/**
 * @fileoverview Shift Store (Firestore Implementation)
 * @module domain/shifts/store
 * 
 * FASE 3 - PASO 6: PRIMER COMANDO REAL (shift.open)
 * 
 * Implementa la persistencia de turnos en Firestore.
 * 
 * Estructura de Firestore:
 * - Colección: companies/{companyId}/shifts/{shiftId}
 */

import * as admin from 'firebase-admin';
import { UserId, CompanyId } from '../../security/auth/types';
import { initializeFirestore } from '../../storage/firestore';
import { ShiftRecord, ShiftId, ActiveShiftQuery } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Subcollection name for shifts within a company.
 */
export const SHIFTS_COLLECTION = 'shifts';

/**
 * Parent collection for companies.
 */
export const COMPANIES_COLLECTION = 'companies';

// ============================================================================
// SHIFT STORE INTERFACE
// ============================================================================

/**
 * Interface for shift storage operations.
 */
export interface ShiftStore {
    /**
     * Check if a user has an active shift.
     */
    getActiveShiftForUser(
        companyId: CompanyId,
        userId: UserId
    ): Promise<ActiveShiftQuery>;

    /**
     * Create a new shift record.
     */
    createShift(shift: ShiftRecord): Promise<void>;

    /**
     * Get a shift by ID.
     */
    getShift(
        companyId: CompanyId,
        shiftId: ShiftId
    ): Promise<ShiftRecord | null>;
}

// ============================================================================
// FIRESTORE DOCUMENT TYPE
// ============================================================================

/**
 * Firestore document representation of ShiftRecord.
 */
interface ShiftDocument {
    shiftId: string;
    userId: string;
    companyId: string;
    status: 'ACTIVE' | 'CLOSED';
    openedAt: admin.firestore.Timestamp;
    closedAt?: admin.firestore.Timestamp;
    openLocation?: {
        latitude: number;
        longitude: number;
    };
    openNotes?: string;
    sourceCommandId: string;
}

/**
 * Converts a ShiftRecord to a Firestore document.
 */
function recordToDocument(record: ShiftRecord): ShiftDocument {
    const doc: ShiftDocument = {
        shiftId: record.shiftId,
        userId: record.userId,
        companyId: record.companyId,
        status: record.status,
        openedAt: admin.firestore.Timestamp.fromMillis(record.openedAt),
        sourceCommandId: record.sourceCommandId
    };

    if (record.closedAt !== undefined) {
        doc.closedAt = admin.firestore.Timestamp.fromMillis(record.closedAt);
    }

    if (record.openLocation !== undefined) {
        doc.openLocation = record.openLocation;
    }

    if (record.openNotes !== undefined) {
        doc.openNotes = record.openNotes;
    }

    return doc;
}

/**
 * Converts a Firestore document to a ShiftRecord.
 */
function documentToRecord(doc: ShiftDocument): ShiftRecord {
    const record: ShiftRecord = {
        shiftId: doc.shiftId,
        userId: doc.userId,
        companyId: doc.companyId,
        status: doc.status,
        openedAt: doc.openedAt.toMillis(),
        sourceCommandId: doc.sourceCommandId,
        ...(doc.closedAt !== undefined && { closedAt: doc.closedAt.toMillis() }),
        ...(doc.openLocation !== undefined && { openLocation: doc.openLocation }),
        ...(doc.openNotes !== undefined && { openNotes: doc.openNotes })
    };

    return record;
}

// ============================================================================
// FIRESTORE IMPLEMENTATION
// ============================================================================

/**
 * Firestore implementation of ShiftStore.
 */
export class FirestoreShiftStore implements ShiftStore {
    private readonly db: admin.firestore.Firestore;

    constructor(firestore?: admin.firestore.Firestore) {
        this.db = firestore ?? initializeFirestore();
    }

    /**
     * Get the shifts collection for a company.
     */
    private shiftsCollection(companyId: CompanyId): admin.firestore.CollectionReference {
        return this.db
            .collection(COMPANIES_COLLECTION)
            .doc(companyId)
            .collection(SHIFTS_COLLECTION);
    }

    async getActiveShiftForUser(
        companyId: CompanyId,
        userId: UserId
    ): Promise<ActiveShiftQuery> {
        const query = this.shiftsCollection(companyId)
            .where('userId', '==', userId)
            .where('status', '==', 'ACTIVE')
            .limit(1);

        const snapshot = await query.get();

        if (snapshot.empty) {
            return { hasActiveShift: false };
        }

        const firstDoc = snapshot.docs[0]!;
        const doc = firstDoc.data() as ShiftDocument;
        return {
            hasActiveShift: true,
            shift: documentToRecord(doc)
        };
    }

    async createShift(shift: ShiftRecord): Promise<void> {
        const docRef = this.shiftsCollection(shift.companyId).doc(shift.shiftId);
        const doc = recordToDocument(shift);

        await docRef.set(doc);
    }

    async getShift(
        companyId: CompanyId,
        shiftId: ShiftId
    ): Promise<ShiftRecord | null> {
        const docRef = this.shiftsCollection(companyId).doc(shiftId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return null;
        }

        return documentToRecord(snapshot.data() as ShiftDocument);
    }
}

// ============================================================================
// FACTORY & SINGLETON
// ============================================================================

let defaultStore: ShiftStore | null = null;

/**
 * Creates a new ShiftStore instance.
 */
export function createShiftStore(
    firestore?: admin.firestore.Firestore
): ShiftStore {
    return new FirestoreShiftStore(firestore);
}

/**
 * Gets the default ShiftStore instance (singleton).
 */
export function getShiftStore(): ShiftStore {
    if (!defaultStore) {
        defaultStore = createShiftStore();
    }
    return defaultStore;
}

/**
 * Resets the default store (for testing).
 */
export function resetShiftStore(): void {
    defaultStore = null;
}
