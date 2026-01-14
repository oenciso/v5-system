/**
 * @fileoverview Checklist Store (Firestore Implementation)
 * @module domain/checklists/store
 * 
 * FASE 3 - PASO 13: PRIMER COMANDO DE CHECKLISTS (checklist.submit)
 * 
 * Implementa la persistencia de submissions de checklists en Firestore.
 * Sigue el mismo patrón que shifts/store.ts
 * 
 * Estructura de Firestore:
 * - Colección: companies/{companyId}/checklistSubmissions/{submissionId}
 */

import * as admin from 'firebase-admin';
import { CompanyId } from '../../security/auth/types';
import { initializeFirestore } from '../../storage/firestore';
import {
    ChecklistSubmissionRecord,
    ChecklistSubmissionId,
    ChecklistSubmissionStatus,
    ChecklistAnswer
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Subcollection name for checklist submissions within a company.
 */
export const CHECKLIST_SUBMISSIONS_COLLECTION = 'checklistSubmissions';

/**
 * Parent collection for companies.
 */
export const COMPANIES_COLLECTION = 'companies';

// ============================================================================
// CHECKLIST STORE INTERFACE
// ============================================================================

/**
 * Interface for checklist storage operations.
 */
export interface ChecklistStore {
    /**
     * Create a new checklist submission.
     */
    createSubmission(submission: ChecklistSubmissionRecord): Promise<void>;

    /**
     * Get a submission by ID.
     */
    getSubmission(
        companyId: CompanyId,
        submissionId: ChecklistSubmissionId
    ): Promise<ChecklistSubmissionRecord | null>;
}

// ============================================================================
// FIRESTORE DOCUMENT TYPE
// ============================================================================

/**
 * Firestore document representation of ChecklistSubmissionRecord.
 */
interface ChecklistSubmissionDocument {
    submissionId: string;
    checklistId: string;
    companyId: string;
    userId: string;
    status: ChecklistSubmissionStatus;
    answers: ChecklistAnswer[];
    submittedAt: admin.firestore.Timestamp;
    notes?: string;
    sourceCommandId: string;
}

/**
 * Converts a ChecklistSubmissionRecord to a Firestore document.
 */
function recordToDocument(record: ChecklistSubmissionRecord): ChecklistSubmissionDocument {
    const doc: ChecklistSubmissionDocument = {
        submissionId: record.submissionId,
        checklistId: record.checklistId,
        companyId: record.companyId,
        userId: record.userId,
        status: record.status,
        answers: record.answers as ChecklistAnswer[],
        submittedAt: admin.firestore.Timestamp.fromMillis(record.submittedAt),
        sourceCommandId: record.sourceCommandId
    };

    if (record.notes !== undefined) {
        doc.notes = record.notes;
    }

    return doc;
}

/**
 * Converts a Firestore document to a ChecklistSubmissionRecord.
 */
function documentToRecord(doc: ChecklistSubmissionDocument): ChecklistSubmissionRecord {
    const record: ChecklistSubmissionRecord = {
        submissionId: doc.submissionId,
        checklistId: doc.checklistId,
        companyId: doc.companyId,
        userId: doc.userId,
        status: doc.status,
        answers: doc.answers,
        submittedAt: doc.submittedAt.toMillis(),
        sourceCommandId: doc.sourceCommandId,
        ...(doc.notes !== undefined && { notes: doc.notes })
    };

    return record;
}

// ============================================================================
// FIRESTORE IMPLEMENTATION
// ============================================================================

/**
 * Firestore implementation of ChecklistStore.
 */
export class FirestoreChecklistStore implements ChecklistStore {
    private readonly db: admin.firestore.Firestore;

    constructor(firestore?: admin.firestore.Firestore) {
        this.db = firestore ?? initializeFirestore();
    }

    /**
     * Get the checklist submissions collection for a company.
     */
    private submissionsCollection(companyId: CompanyId): admin.firestore.CollectionReference {
        return this.db
            .collection(COMPANIES_COLLECTION)
            .doc(companyId)
            .collection(CHECKLIST_SUBMISSIONS_COLLECTION);
    }

    async createSubmission(submission: ChecklistSubmissionRecord): Promise<void> {
        const docRef = this.submissionsCollection(submission.companyId).doc(submission.submissionId);
        const doc = recordToDocument(submission);

        await docRef.set(doc);
    }

    async getSubmission(
        companyId: CompanyId,
        submissionId: ChecklistSubmissionId
    ): Promise<ChecklistSubmissionRecord | null> {
        const docRef = this.submissionsCollection(companyId).doc(submissionId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return null;
        }

        return documentToRecord(snapshot.data() as ChecklistSubmissionDocument);
    }
}

// ============================================================================
// FACTORY & SINGLETON
// ============================================================================

let defaultStore: ChecklistStore | null = null;

/**
 * Creates a new ChecklistStore instance.
 */
export function createChecklistStore(
    firestore?: admin.firestore.Firestore
): ChecklistStore {
    return new FirestoreChecklistStore(firestore);
}

/**
 * Gets the default ChecklistStore instance (singleton).
 */
export function getChecklistStore(): ChecklistStore {
    if (!defaultStore) {
        defaultStore = createChecklistStore();
    }
    return defaultStore;
}

/**
 * Resets the default store (for testing).
 */
export function resetChecklistStore(): void {
    defaultStore = null;
}
