/**
 * @fileoverview Rondin Store (Firestore Implementation)
 * @module domain/rondins/store
 * 
 * FASE 3 - PASO 10: PRIMER COMANDO DE RONDINES (rondin.start)
 * 
 * Implementa la persistencia de rondines en Firestore.
 * Sigue el mismo patrón que shifts/store.ts
 * 
 * Estructura de Firestore:
 * - Colección: companies/{companyId}/rondins/{rondinId}
 */

import * as admin from 'firebase-admin';
import { UserId, CompanyId } from '../../security/auth/types';
import { initializeFirestore } from '../../storage/firestore';
import {
    RondinRecord,
    RondinId,
    RondinStatus,
    GeoLocation,
    ActiveRondinQuery
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Subcollection name for rondins within a company.
 */
export const RONDINS_COLLECTION = 'rondins';

/**
 * Parent collection for companies.
 */
export const COMPANIES_COLLECTION = 'companies';

// ============================================================================
// RONDIN STORE INTERFACE
// ============================================================================

/**
 * Interface for rondin storage operations.
 */
export interface RondinStore {
    /**
     * Check if a user has an active rondin.
     */
    getActiveRondinForUser(
        companyId: CompanyId,
        userId: UserId
    ): Promise<ActiveRondinQuery>;

    /**
     * Create a new rondin record.
     */
    createRondin(rondin: RondinRecord): Promise<void>;

    /**
     * Get a rondin by ID.
     */
    getRondin(
        companyId: CompanyId,
        rondinId: RondinId
    ): Promise<RondinRecord | null>;
}

// ============================================================================
// FIRESTORE DOCUMENT TYPE
// ============================================================================

/**
 * Firestore document representation of RondinRecord.
 */
interface RondinDocument {
    rondinId: string;
    companyId: string;
    userId: string;
    routeId: string;
    status: RondinStatus;
    startedAt: admin.firestore.Timestamp;
    finishedAt?: admin.firestore.Timestamp;
    startLocation?: GeoLocation;
    sourceCommandId: string;
}

/**
 * Converts a RondinRecord to a Firestore document.
 */
function recordToDocument(record: RondinRecord): RondinDocument {
    const doc: RondinDocument = {
        rondinId: record.rondinId,
        companyId: record.companyId,
        userId: record.userId,
        routeId: record.routeId,
        status: record.status,
        startedAt: admin.firestore.Timestamp.fromMillis(record.startedAt),
        sourceCommandId: record.sourceCommandId
    };

    if (record.finishedAt !== undefined) {
        doc.finishedAt = admin.firestore.Timestamp.fromMillis(record.finishedAt);
    }

    if (record.startLocation !== undefined) {
        doc.startLocation = record.startLocation;
    }

    return doc;
}

/**
 * Converts a Firestore document to a RondinRecord.
 */
function documentToRecord(doc: RondinDocument): RondinRecord {
    const record: RondinRecord = {
        rondinId: doc.rondinId,
        companyId: doc.companyId,
        userId: doc.userId,
        routeId: doc.routeId,
        status: doc.status,
        startedAt: doc.startedAt.toMillis(),
        sourceCommandId: doc.sourceCommandId,
        ...(doc.finishedAt !== undefined && { finishedAt: doc.finishedAt.toMillis() }),
        ...(doc.startLocation !== undefined && { startLocation: doc.startLocation })
    };

    return record;
}

// ============================================================================
// FIRESTORE IMPLEMENTATION
// ============================================================================

/**
 * Firestore implementation of RondinStore.
 */
export class FirestoreRondinStore implements RondinStore {
    private readonly db: admin.firestore.Firestore;

    constructor(firestore?: admin.firestore.Firestore) {
        this.db = firestore ?? initializeFirestore();
    }

    /**
     * Get the rondins collection for a company.
     */
    private rondinsCollection(companyId: CompanyId): admin.firestore.CollectionReference {
        return this.db
            .collection(COMPANIES_COLLECTION)
            .doc(companyId)
            .collection(RONDINS_COLLECTION);
    }

    async getActiveRondinForUser(
        companyId: CompanyId,
        userId: UserId
    ): Promise<ActiveRondinQuery> {
        const query = this.rondinsCollection(companyId)
            .where('userId', '==', userId)
            .where('status', '==', 'ACTIVE')
            .limit(1);

        const snapshot = await query.get();

        if (snapshot.empty) {
            return { hasActiveRondin: false };
        }

        const firstDoc = snapshot.docs[0]!;
        const doc = firstDoc.data() as RondinDocument;
        return {
            hasActiveRondin: true,
            rondin: documentToRecord(doc)
        };
    }

    async createRondin(rondin: RondinRecord): Promise<void> {
        const docRef = this.rondinsCollection(rondin.companyId).doc(rondin.rondinId);
        const doc = recordToDocument(rondin);

        await docRef.set(doc);
    }

    async getRondin(
        companyId: CompanyId,
        rondinId: RondinId
    ): Promise<RondinRecord | null> {
        const docRef = this.rondinsCollection(companyId).doc(rondinId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return null;
        }

        return documentToRecord(snapshot.data() as RondinDocument);
    }
}

// ============================================================================
// FACTORY & SINGLETON
// ============================================================================

let defaultStore: RondinStore | null = null;

/**
 * Creates a new RondinStore instance.
 */
export function createRondinStore(
    firestore?: admin.firestore.Firestore
): RondinStore {
    return new FirestoreRondinStore(firestore);
}

/**
 * Gets the default RondinStore instance (singleton).
 */
export function getRondinStore(): RondinStore {
    if (!defaultStore) {
        defaultStore = createRondinStore();
    }
    return defaultStore;
}

/**
 * Resets the default store (for testing).
 */
export function resetRondinStore(): void {
    defaultStore = null;
}
