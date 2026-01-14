/**
 * @fileoverview Audit Store (Firestore Implementation)
 * @module audit/store
 * 
 * FASE 3 - PASO 6: PRIMER COMANDO REAL (shift.open)
 * 
 * Implementa la persistencia de registros de auditoría en Firestore.
 * Los registros de auditoría son append-only (inmutables).
 * 
 * Estructura de Firestore:
 * - Colección: companies/{companyId}/audit/{auditId}
 */

import * as admin from 'firebase-admin';
import { UserId, CompanyId, UserRole } from '../security/auth/types';
import { CommandId, CommandType } from '../commands/contracts';
import { initializeFirestore } from '../storage/firestore';

// ============================================================================
// AUDIT TYPES
// ============================================================================

/**
 * Unique identifier for an audit record.
 */
export type AuditId = string;

/**
 * Result of a command for audit purposes.
 */
export type AuditResult = 'ACCEPTED' | 'REJECTED';

/**
 * An audit record stored in Firestore.
 * 
 * Collection: companies/{companyId}/audit/{auditId}
 * 
 * INVARIANTES_DE_PRODUCCION.md:
 * > "Toda operación se audita."
 * > "Los registros de auditoría son append-only."
 */
export interface AuditRecord {
    /** Unique audit record identifier */
    readonly auditId: AuditId;

    /** Command ID that was audited */
    readonly commandId: CommandId;

    /** Type of command */
    readonly commandType: CommandType;

    /** Company where the command was executed */
    readonly companyId: CompanyId;

    /** User who executed the command */
    readonly userId: UserId;

    /** Role of the user at execution time */
    readonly userRole: UserRole;

    /** Result of the command */
    readonly result: AuditResult;

    /** Rejection code if result is REJECTED */
    readonly rejectionCode?: string;

    /** Timestamp of the audit record (Unix ms) */
    readonly timestamp: number;

    /** Duration of command execution (ms) */
    readonly durationMs: number;

    /** Additional context (command-specific) */
    readonly context?: Record<string, unknown>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Subcollection name for audit records within a company.
 */
export const AUDIT_COLLECTION = 'audit';

/**
 * Parent collection for companies.
 */
export const COMPANIES_COLLECTION = 'companies';

// ============================================================================
// AUDIT STORE INTERFACE
// ============================================================================

/**
 * Interface for audit storage operations.
 */
export interface AuditStore {
    /**
     * Append an audit record.
     * 
     * Audit records are immutable once written.
     */
    appendAuditRecord(record: AuditRecord): Promise<void>;
}

// ============================================================================
// FIRESTORE DOCUMENT TYPE
// ============================================================================

/**
 * Firestore document representation of AuditRecord.
 */
interface AuditDocument {
    auditId: string;
    commandId: string;
    commandType: string;
    companyId: string;
    userId: string;
    userRole: string;
    result: 'ACCEPTED' | 'REJECTED';
    rejectionCode?: string;
    timestamp: admin.firestore.Timestamp;
    durationMs: number;
    context?: Record<string, unknown>;
}

/**
 * Converts an AuditRecord to a Firestore document.
 */
function recordToDocument(record: AuditRecord): AuditDocument {
    const doc: AuditDocument = {
        auditId: record.auditId,
        commandId: record.commandId,
        commandType: record.commandType,
        companyId: record.companyId,
        userId: record.userId,
        userRole: record.userRole,
        result: record.result,
        timestamp: admin.firestore.Timestamp.fromMillis(record.timestamp),
        durationMs: record.durationMs
    };

    if (record.rejectionCode !== undefined) {
        doc.rejectionCode = record.rejectionCode;
    }

    if (record.context !== undefined) {
        doc.context = record.context;
    }

    return doc;
}

// ============================================================================
// FIRESTORE IMPLEMENTATION
// ============================================================================

/**
 * Firestore implementation of AuditStore.
 */
export class FirestoreAuditStore implements AuditStore {
    private readonly db: admin.firestore.Firestore;

    constructor(firestore?: admin.firestore.Firestore) {
        this.db = firestore ?? initializeFirestore();
    }

    /**
     * Get the audit collection for a company.
     */
    private auditCollection(companyId: CompanyId): admin.firestore.CollectionReference {
        return this.db
            .collection(COMPANIES_COLLECTION)
            .doc(companyId)
            .collection(AUDIT_COLLECTION);
    }

    async appendAuditRecord(record: AuditRecord): Promise<void> {
        const docRef = this.auditCollection(record.companyId).doc(record.auditId);
        const doc = recordToDocument(record);

        // Use set with merge: false to ensure we never update existing records
        await docRef.create(doc);
    }
}

// ============================================================================
// FACTORY & SINGLETON
// ============================================================================

let defaultStore: AuditStore | null = null;

/**
 * Creates a new AuditStore instance.
 */
export function createAuditStore(
    firestore?: admin.firestore.Firestore
): AuditStore {
    return new FirestoreAuditStore(firestore);
}

/**
 * Gets the default AuditStore instance (singleton).
 */
export function getAuditStore(): AuditStore {
    if (!defaultStore) {
        defaultStore = createAuditStore();
    }
    return defaultStore;
}

/**
 * Resets the default store (for testing).
 */
export function resetAuditStore(): void {
    defaultStore = null;
}

// ============================================================================
// HELPER: GENERATE AUDIT ID
// ============================================================================

/**
 * Generates a unique audit ID.
 * 
 * Format: audit_{timestamp}_{random}
 */
export function generateAuditId(): AuditId {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `audit_${timestamp}_${random}`;
}
