/**
 * @fileoverview Incident Store (Firestore Implementation)
 * @module domain/incidents/store
 * 
 * FASE 3 - PASO 8: PRIMER COMANDO DE INCIDENTES (incident.create)
 * 
 * Implementa la persistencia de incidentes en Firestore.
 * Sigue el mismo patrón que shifts/store.ts
 * 
 * Estructura de Firestore:
 * - Colección: companies/{companyId}/incidents/{incidentId}
 */

import * as admin from 'firebase-admin';
import { CompanyId } from '../../security/auth/types';
import { initializeFirestore } from '../../storage/firestore';
import {
    IncidentRecord,
    IncidentId,
    IncidentStatus,
    IncidentSeverity,
    GeoLocation
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Subcollection name for incidents within a company.
 */
export const INCIDENTS_COLLECTION = 'incidents';

/**
 * Parent collection for companies.
 */
export const COMPANIES_COLLECTION = 'companies';

// ============================================================================
// INCIDENT STORE INTERFACE
// ============================================================================

/**
 * Interface for incident storage operations.
 */
export interface IncidentStore {
    /**
     * Create a new incident record.
     */
    createIncident(incident: IncidentRecord): Promise<void>;

    /**
     * Get an incident by ID.
     */
    getIncident(
        companyId: CompanyId,
        incidentId: IncidentId
    ): Promise<IncidentRecord | null>;
}

// ============================================================================
// FIRESTORE DOCUMENT TYPE
// ============================================================================

/**
 * Firestore document representation of IncidentRecord.
 */
interface IncidentDocument {
    incidentId: string;
    reporterId: string;
    companyId: string;
    status: IncidentStatus;
    title: string;
    description?: string;
    severity: IncidentSeverity;
    location?: GeoLocation;
    createdAt: admin.firestore.Timestamp;
    closedAt?: admin.firestore.Timestamp;
    sourceCommandId: string;
    evidenceRefs?: string[];
}

/**
 * Converts an IncidentRecord to a Firestore document.
 */
function recordToDocument(record: IncidentRecord): IncidentDocument {
    const doc: IncidentDocument = {
        incidentId: record.incidentId,
        reporterId: record.reporterId,
        companyId: record.companyId,
        status: record.status,
        title: record.title,
        severity: record.severity,
        createdAt: admin.firestore.Timestamp.fromMillis(record.createdAt),
        sourceCommandId: record.sourceCommandId
    };

    if (record.description !== undefined) {
        doc.description = record.description;
    }

    if (record.location !== undefined) {
        doc.location = record.location;
    }

    if (record.closedAt !== undefined) {
        doc.closedAt = admin.firestore.Timestamp.fromMillis(record.closedAt);
    }

    if (record.evidenceRefs !== undefined && record.evidenceRefs.length > 0) {
        doc.evidenceRefs = [...record.evidenceRefs];
    }

    return doc;
}

/**
 * Converts a Firestore document to an IncidentRecord.
 */
function documentToRecord(doc: IncidentDocument): IncidentRecord {
    const record: IncidentRecord = {
        incidentId: doc.incidentId,
        reporterId: doc.reporterId,
        companyId: doc.companyId,
        status: doc.status,
        title: doc.title,
        severity: doc.severity,
        createdAt: doc.createdAt.toMillis(),
        sourceCommandId: doc.sourceCommandId,
        ...(doc.description !== undefined && { description: doc.description }),
        ...(doc.location !== undefined && { location: doc.location }),
        ...(doc.closedAt !== undefined && { closedAt: doc.closedAt.toMillis() }),
        ...(doc.evidenceRefs !== undefined && doc.evidenceRefs.length > 0 && {
            evidenceRefs: doc.evidenceRefs
        })
    };

    return record;
}

// ============================================================================
// FIRESTORE IMPLEMENTATION
// ============================================================================

/**
 * Firestore implementation of IncidentStore.
 */
export class FirestoreIncidentStore implements IncidentStore {
    private readonly db: admin.firestore.Firestore;

    constructor(firestore?: admin.firestore.Firestore) {
        this.db = firestore ?? initializeFirestore();
    }

    /**
     * Get the incidents collection for a company.
     */
    private incidentsCollection(companyId: CompanyId): admin.firestore.CollectionReference {
        return this.db
            .collection(COMPANIES_COLLECTION)
            .doc(companyId)
            .collection(INCIDENTS_COLLECTION);
    }

    async createIncident(incident: IncidentRecord): Promise<void> {
        const docRef = this.incidentsCollection(incident.companyId).doc(incident.incidentId);
        const doc = recordToDocument(incident);

        await docRef.set(doc);
    }

    async getIncident(
        companyId: CompanyId,
        incidentId: IncidentId
    ): Promise<IncidentRecord | null> {
        const docRef = this.incidentsCollection(companyId).doc(incidentId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return null;
        }

        return documentToRecord(snapshot.data() as IncidentDocument);
    }
}

// ============================================================================
// FACTORY & SINGLETON
// ============================================================================

let defaultStore: IncidentStore | null = null;

/**
 * Creates a new IncidentStore instance.
 */
export function createIncidentStore(
    firestore?: admin.firestore.Firestore
): IncidentStore {
    return new FirestoreIncidentStore(firestore);
}

/**
 * Gets the default IncidentStore instance (singleton).
 */
export function getIncidentStore(): IncidentStore {
    if (!defaultStore) {
        defaultStore = createIncidentStore();
    }
    return defaultStore;
}

/**
 * Resets the default store (for testing).
 */
export function resetIncidentStore(): void {
    defaultStore = null;
}
