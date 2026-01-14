/**
 * @fileoverview Checklists Domain Module Public API
 * @module domain/checklists
 * 
 * FASE 3 - PASO 13
 */

// Types
export type {
    ChecklistId,
    ChecklistSubmissionId,
    ChecklistSubmissionStatus,
    ChecklistAnswer,
    ChecklistSubmissionRecord,
    ChecklistSubmitPayload,
    ChecklistSubmitReceipt
} from './types';

// Store
export type {
    ChecklistStore
} from './store';

export {
    CHECKLIST_SUBMISSIONS_COLLECTION,
    COMPANIES_COLLECTION,
    FirestoreChecklistStore,
    createChecklistStore,
    getChecklistStore,
    resetChecklistStore
} from './store';

// Commands - checklist.submit
export {
    isChecklistSubmitCommand,
    validateChecklistSubmitPayload,
    checkChecklistSubmitPreconditions,
    executeChecklistSubmit,
    persistChecklistSubmission,
    emitChecklistSubmitAudit
} from './commands/submit';

export type {
    ChecklistSubmitExecutionContext,
    ChecklistSubmitDependencies
} from './commands/submit';
