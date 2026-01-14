/**
 * @fileoverview Audit Module Public API
 * @module audit
 * 
 * FASE 3 - PASO 6
 */

export type {
    AuditId,
    AuditResult,
    AuditRecord,
    AuditStore
} from './store';

export {
    AUDIT_COLLECTION,
    COMPANIES_COLLECTION,
    FirestoreAuditStore,
    createAuditStore,
    getAuditStore,
    resetAuditStore,
    generateAuditId
} from './store';
