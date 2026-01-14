/**
 * @fileoverview Checklist Domain Types and Contracts
 * @module domain/checklists/types
 * 
 * FASE 3 - PASO 13: PRIMER COMANDO DE CHECKLISTS (checklist.submit)
 * 
 * Define los tipos de dominio para checklists.
 * Sigue el mismo patrón que shifts, incidents, y rondins.
 */

import { UserId, CompanyId } from '../../security/auth/types';

// ============================================================================
// CHECKLIST TYPES
// ============================================================================

/**
 * Unique identifier for a checklist template.
 */
export type ChecklistId = string;

/**
 * Unique identifier for a checklist submission.
 */
export type ChecklistSubmissionId = string;

/**
 * Status of a checklist submission.
 */
export type ChecklistSubmissionStatus = 'SUBMITTED';

/**
 * A single answer in a checklist submission.
 */
export interface ChecklistAnswer {
    /** Question identifier */
    readonly questionId: string;

    /** Answer value (could be string, boolean, number, etc.) */
    readonly value: unknown;

    /** Optional notes for this answer */
    readonly notes?: string;
}

/**
 * A checklist submission record stored in Firestore.
 * 
 * Collection: companies/{companyId}/checklistSubmissions/{submissionId}
 */
export interface ChecklistSubmissionRecord {
    /** Unique submission identifier */
    readonly submissionId: ChecklistSubmissionId;

    /** ID of the checklist template being submitted */
    readonly checklistId: ChecklistId;

    /** Company the submission belongs to */
    readonly companyId: CompanyId;

    /** User who submitted the checklist */
    readonly userId: UserId;

    /** Status of the submission */
    readonly status: ChecklistSubmissionStatus;

    /** Answers to the checklist questions */
    readonly answers: readonly ChecklistAnswer[];

    /** Timestamp when checklist was submitted (Unix ms) */
    readonly submittedAt: number;

    /** Optional notes for the overall submission */
    readonly notes?: string;

    /** Command ID that created this submission (for idempotency tracing) */
    readonly sourceCommandId: string;
}

// ============================================================================
// CHECKLIST.SUBMIT PAYLOAD
// ============================================================================

/**
 * Payload for checklist.submit command.
 */
export interface ChecklistSubmitPayload {
    /** ID of the checklist template (required) */
    readonly checklistId: ChecklistId;

    /** Answers to the checklist questions (required, non-empty) */
    readonly answers: readonly ChecklistAnswer[];

    /** Optional notes for the overall submission */
    readonly notes?: string;
}

/**
 * Receipt returned after checklist.submit command succeeds.
 */
export interface ChecklistSubmitReceipt {
    /** ID of the created submission */
    readonly submissionId: ChecklistSubmissionId;

    /** ID of the checklist template */
    readonly checklistId: ChecklistId;

    /** Timestamp when checklist was submitted */
    readonly submittedAt: number;

    /** Number of answers recorded */
    readonly answerCount: number;
}
