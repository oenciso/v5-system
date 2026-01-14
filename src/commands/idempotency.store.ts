/**
 * @fileoverview Idempotency Store (Firestore Implementation)
 * @module commands/idempotency.store
 * 
 * FASE 3 - PASO 5: PERSISTENCIA DE IDEMPOTENCIA
 * 
 * Este módulo implementa la persistencia de registros de idempotencia en Firestore.
 * 
 * Estructura de Firestore:
 * - Colección: `idempotency`
 * - Documento ID: `{companyId}_{commandId}` (clave compuesta)
 * 
 * Contratos consumidos (FROZEN):
 * - IdempotencyRecord (src/commands/idempotency.ts)
 * - IdempotencyCheckResult (src/commands/idempotency.ts)
 * 
 * IMPORTANTE:
 * - Solo almacena registros de idempotencia
 * - NO escribe datos de dominio
 * - NO ejecuta lógica de negocio
 */

import * as admin from 'firebase-admin';
import { CompanyId } from '../security/auth/types';
import { CommandId, RejectionCode } from './contracts';
import {
    IdempotencyRecord,
    IdempotencyStatus,
    IdempotencyResultCode,
    IdempotencyCheckResult,
    IdempotencyNew,
    IdempotencyInFlight,
    IdempotencyCached,
    IDEMPOTENCY_TTL_MS,
    PENDING_TIMEOUT_MS
} from './idempotency';
import { initializeFirestore } from '../storage/firestore';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Firestore collection name for idempotency records.
 */
export const IDEMPOTENCY_COLLECTION = 'idempotency';

// ============================================================================
// DOCUMENT KEY
// ============================================================================

/**
 * Creates a composite document ID from companyId and commandId.
 * 
 * Format: `{companyId}_{commandId}`
 * 
 * This ensures:
 * - Tenant isolation (companyId prefix)
 * - Unique per command within tenant
 * - Efficient queries by company
 * 
 * @param companyId - Company ID (tenant)
 * @param commandId - Command ID
 * @returns Composite document ID
 */
export function createDocumentId(companyId: CompanyId, commandId: CommandId): string {
    return `${companyId}_${commandId}`;
}

// ============================================================================
// FIRESTORE DOCUMENT TYPE
// ============================================================================

/**
 * Firestore document representation of IdempotencyRecord.
 * 
 * Uses Firestore Timestamps for better querying and TTL.
 */
interface IdempotencyDocument {
    commandId: string;
    companyId: string;
    status: IdempotencyStatus;
    createdAt: admin.firestore.Timestamp;
    resolvedAt?: admin.firestore.Timestamp;
    resultCode?: IdempotencyResultCode;
    // TTL field for Firestore TTL policy
    expiresAt: admin.firestore.Timestamp;
}

/**
 * Converts an IdempotencyDocument to an IdempotencyRecord.
 */
function documentToRecord(doc: IdempotencyDocument): IdempotencyRecord {
    const resolvedAtMs = doc.resolvedAt?.toMillis();

    // Build record with proper handling of optional properties
    const record: IdempotencyRecord = {
        commandId: doc.commandId,
        companyId: doc.companyId,
        status: doc.status,
        createdAt: doc.createdAt.toMillis(),
        // Only include if defined (exactOptionalPropertyTypes)
        ...(resolvedAtMs !== undefined && { resolvedAt: resolvedAtMs }),
        ...(doc.resultCode !== undefined && { resultCode: doc.resultCode })
    };

    return record;
}

// ============================================================================
// IDEMPOTENCY STORE INTERFACE
// ============================================================================

/**
 * Interface for idempotency storage operations.
 * 
 * This abstraction allows for different implementations (Firestore, in-memory, etc.)
 */
export interface IdempotencyStore {
    /**
     * Check idempotency status for a command.
     * 
     * Behavior:
     * 1. If no record exists → return IdempotencyNew
     * 2. If PENDING and not timed out → return IdempotencyInFlight
     * 3. If PENDING and timed out → treat as new (cleanup stale record)
     * 4. If ACCEPTED → return IdempotencyCached (success)
     * 5. If REJECTED → return IdempotencyCached (rejection)
     * 
     * @param companyId - Company ID (tenant)
     * @param commandId - Command ID
     * @returns IdempotencyCheckResult indicating how to proceed
     */
    checkIdempotency(
        companyId: CompanyId,
        commandId: CommandId
    ): Promise<IdempotencyCheckResult>;

    /**
     * Create a PENDING idempotency record.
     * 
     * Called when a new command is about to be processed.
     * Uses Firestore transaction to ensure atomicity.
     * 
     * @param companyId - Company ID (tenant)
     * @param commandId - Command ID
     * @returns true if record was created, false if already exists
     */
    createPendingRecord(
        companyId: CompanyId,
        commandId: CommandId
    ): Promise<boolean>;

    /**
     * Mark a command as ACCEPTED.
     * 
     * Called after successful command execution.
     * 
     * @param companyId - Company ID (tenant)
     * @param commandId - Command ID
     */
    markAccepted(
        companyId: CompanyId,
        commandId: CommandId
    ): Promise<void>;

    /**
     * Mark a command as REJECTED with a specific code.
     * 
     * Called after command rejection.
     * 
     * @param companyId - Company ID (tenant)
     * @param commandId - Command ID
     * @param rejectionCode - Reason for rejection
     */
    markRejected(
        companyId: CompanyId,
        commandId: CommandId,
        rejectionCode: RejectionCode
    ): Promise<void>;
}

// ============================================================================
// FIRESTORE IMPLEMENTATION
// ============================================================================

/**
 * Firestore implementation of IdempotencyStore.
 * 
 * Uses Firestore transactions for atomic operations.
 * Handles TTL and PENDING timeout logic.
 */
export class FirestoreIdempotencyStore implements IdempotencyStore {
    private readonly db: admin.firestore.Firestore;

    constructor(firestore?: admin.firestore.Firestore) {
        this.db = firestore ?? initializeFirestore();
    }

    /**
     * Get reference to the idempotency collection.
     */
    private get collection(): admin.firestore.CollectionReference {
        return this.db.collection(IDEMPOTENCY_COLLECTION);
    }

    /**
     * Get reference to a specific idempotency document.
     */
    private docRef(companyId: CompanyId, commandId: CommandId): admin.firestore.DocumentReference {
        return this.collection.doc(createDocumentId(companyId, commandId));
    }

    /**
     * Check if a PENDING record has timed out.
     */
    private isPendingTimedOut(record: IdempotencyRecord): boolean {
        const now = Date.now();
        return now - record.createdAt > PENDING_TIMEOUT_MS;
    }

    /**
     * Check if a record has expired (past TTL).
     */
    private isExpired(record: IdempotencyRecord): boolean {
        const now = Date.now();
        return now - record.createdAt > IDEMPOTENCY_TTL_MS;
    }

    async checkIdempotency(
        companyId: CompanyId,
        commandId: CommandId
    ): Promise<IdempotencyCheckResult> {
        const docRef = this.docRef(companyId, commandId);
        const snapshot = await docRef.get();

        // Case 1: No record exists → new command
        if (!snapshot.exists) {
            const result: IdempotencyNew = {
                behavior: 'CREATE_AND_PROCESS'
            };
            return result;
        }

        const doc = snapshot.data() as IdempotencyDocument;
        const record = documentToRecord(doc);

        // Check if record has expired (past TTL)
        if (this.isExpired(record)) {
            // Treat as new command, will be overwritten
            const result: IdempotencyNew = {
                behavior: 'CREATE_AND_PROCESS'
            };
            return result;
        }

        // Case 2: PENDING
        if (record.status === 'PENDING') {
            // Check for timeout
            if (this.isPendingTimedOut(record)) {
                // Stale PENDING, treat as new (will overwrite)
                const result: IdempotencyNew = {
                    behavior: 'CREATE_AND_PROCESS'
                };
                return result;
            }

            // Active PENDING → reject as in-flight
            const result: IdempotencyInFlight = {
                behavior: 'REJECT_IN_FLIGHT',
                record
            };
            return result;
        }

        // Case 3 & 4: ACCEPTED or REJECTED → return cached
        const behavior = record.status === 'ACCEPTED'
            ? 'RETURN_CACHED_SUCCESS' as const
            : 'RETURN_CACHED_REJECTION' as const;

        const result: IdempotencyCached = {
            behavior,
            record
        };
        return result;
    }

    async createPendingRecord(
        companyId: CompanyId,
        commandId: CommandId
    ): Promise<boolean> {
        const docRef = this.docRef(companyId, commandId);
        const now = admin.firestore.Timestamp.now();
        const expiresAt = admin.firestore.Timestamp.fromMillis(
            now.toMillis() + IDEMPOTENCY_TTL_MS
        );

        try {
            // Use transaction to ensure atomicity
            const success = await this.db.runTransaction(async (transaction) => {
                const snapshot = await transaction.get(docRef);

                // If document exists and is not expired/stale, don't overwrite
                if (snapshot.exists) {
                    const doc = snapshot.data() as IdempotencyDocument;
                    const record = documentToRecord(doc);

                    // If not expired and not stale PENDING, reject
                    if (!this.isExpired(record)) {
                        if (record.status !== 'PENDING' || !this.isPendingTimedOut(record)) {
                            return false;
                        }
                    }
                }

                // Create new PENDING record
                const newDoc: IdempotencyDocument = {
                    commandId,
                    companyId,
                    status: 'PENDING',
                    createdAt: now,
                    expiresAt
                };

                transaction.set(docRef, newDoc);
                return true;
            });

            return success;
        } catch (error) {
            // Log error but don't throw - let pipeline handle it
            console.error('Failed to create idempotency record:', error);
            return false;
        }
    }

    async markAccepted(
        companyId: CompanyId,
        commandId: CommandId
    ): Promise<void> {
        const docRef = this.docRef(companyId, commandId);
        const now = admin.firestore.Timestamp.now();

        await docRef.update({
            status: 'ACCEPTED' as IdempotencyStatus,
            resolvedAt: now,
            resultCode: 'SUCCESS' as IdempotencyResultCode
        });
    }

    async markRejected(
        companyId: CompanyId,
        commandId: CommandId,
        rejectionCode: RejectionCode
    ): Promise<void> {
        const docRef = this.docRef(companyId, commandId);
        const now = admin.firestore.Timestamp.now();

        await docRef.update({
            status: 'REJECTED' as IdempotencyStatus,
            resolvedAt: now,
            resultCode: rejectionCode as IdempotencyResultCode
        });
    }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Creates a new FirestoreIdempotencyStore instance.
 * 
 * @param firestore - Optional Firestore instance (for testing)
 * @returns IdempotencyStore implementation
 */
export function createIdempotencyStore(
    firestore?: admin.firestore.Firestore
): IdempotencyStore {
    return new FirestoreIdempotencyStore(firestore);
}

// ============================================================================
// SINGLETON
// ============================================================================

let defaultStore: IdempotencyStore | null = null;

/**
 * Gets the default IdempotencyStore instance (singleton).
 * 
 * Creates a new instance if one doesn't exist.
 * 
 * @returns IdempotencyStore instance
 */
export function getIdempotencyStore(): IdempotencyStore {
    if (!defaultStore) {
        defaultStore = createIdempotencyStore();
    }
    return defaultStore;
}

/**
 * Resets the default store (for testing).
 */
export function resetIdempotencyStore(): void {
    defaultStore = null;
}
