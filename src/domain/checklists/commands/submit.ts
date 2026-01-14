/**
 * @fileoverview Checklist.Submit Command Handler
 * @module domain/checklists/commands/submit
 * 
 * FASE 3 - PASO 13: PRIMER COMANDO DE CHECKLISTS (checklist.submit)
 * 
 * Implementa el comando checklist.submit de extremo a extremo.
 * Sigue la misma plantilla que incident.create.
 * 
 * Flujo completo:
 * 1. PAYLOAD_VALIDATION - Valida checklistId, answers, notes
 * 2. PRECONDITION_CHECK - Usuario autenticado (no domain-specific preconditions)
 * 3. EXECUTION - Genera ChecklistSubmissionRecord
 * 4. PERSISTENCE - Escribe a Firestore
 * 5. AUDIT_EMISSION - Registra auditoría
 */

import { DomainCommand } from '../../../commands/contracts';
import { CommandExecutionContext, createPipelineFailure } from '../../../commands/pipeline';
import { AuthenticatedIdentity } from '../../../security/auth/types';
import { ChecklistSubmitPayload, ChecklistSubmitReceipt, ChecklistSubmissionRecord } from '../types';
import { ChecklistStore, getChecklistStore } from '../store';
import { AuditStore, AuditRecord, getAuditStore, generateAuditId } from '../../../audit/store';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Extended context for checklist.submit execution.
 * 
 * Contains command-specific data accumulated during execution.
 */
export interface ChecklistSubmitExecutionContext extends CommandExecutionContext<ChecklistSubmitPayload> {
    /** Generated submission record (after EXECUTION) */
    readonly submissionRecord?: ChecklistSubmissionRecord;

    /** Receipt to return to client (after PERSISTENCE) */
    readonly receipt?: ChecklistSubmitReceipt;
}

/**
 * Dependencies for checklist.submit command handlers.
 */
export interface ChecklistSubmitDependencies {
    readonly checklistStore?: ChecklistStore | undefined;
    readonly auditStore?: AuditStore | undefined;
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validates the checklist.submit payload.
 * 
 * Validation rules:
 * - checklistId required, non-empty string
 * - answers required, non-empty array
 * - each answer must have questionId and value
 * - notes optional string
 */
export async function validateChecklistSubmitPayload(
    context: ChecklistSubmitExecutionContext
): Promise<ChecklistSubmitExecutionContext> {
    const command = context.command;

    if (!command) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INTERNAL_ERROR',
            'Command not found in context'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    const payload = command.payload;

    // Validate checklistId (required, non-empty)
    if (typeof payload.checklistId !== 'string') {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Checklist ID is required and must be a string'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    if (payload.checklistId.trim().length === 0) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Checklist ID cannot be empty'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    // Validate answers (required, non-empty array)
    if (!Array.isArray(payload.answers)) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Answers must be an array'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    if (payload.answers.length === 0) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Answers cannot be empty'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    // Validate each answer
    for (let i = 0; i < payload.answers.length; i++) {
        const answer = payload.answers[i];

        if (!answer || typeof answer !== 'object') {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                `Answer at index ${i} must be an object`
            );
            return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
        }

        if (typeof answer.questionId !== 'string' || answer.questionId.trim().length === 0) {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                `Answer at index ${i} must have a non-empty questionId`
            );
            return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
        }

        // value can be any type, but must be present
        if (answer.value === undefined) {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                `Answer at index ${i} must have a value`
            );
            return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
        }

        // notes is optional but must be string if present
        if (answer.notes !== undefined && typeof answer.notes !== 'string') {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                `Answer at index ${i} notes must be a string`
            );
            return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
        }
    }

    // Validate notes if provided
    if (payload.notes !== undefined && typeof payload.notes !== 'string') {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Notes must be a string'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    // Payload is valid
    return {
        ...context,
        currentStage: 'PAYLOAD_VALIDATION',
        payloadValid: true
    };
}

// ============================================================================
// PRECONDITION CHECK
// ============================================================================

/**
 * Checks checklist.submit preconditions.
 * 
 * Preconditions:
 * - User must be authenticated
 * 
 * Note: No domain-specific preconditions for creating a checklist submission.
 * The security kernel handles authentication and authorization.
 */
export async function checkChecklistSubmitPreconditions(
    context: ChecklistSubmitExecutionContext,
    _deps?: ChecklistSubmitDependencies
): Promise<ChecklistSubmitExecutionContext> {
    const identity = context.identity;

    if (!identity || identity.kind !== 'authenticated') {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INTERNAL_ERROR',
            'Authenticated identity required for precondition check'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // No additional domain preconditions for checklist submission
    // The checklist template validation could be added here in the future

    return {
        ...context,
        currentStage: 'PRECONDITION_CHECK',
        preconditionsMet: true
    };
}

// ============================================================================
// EXECUTION
// ============================================================================

/**
 * Generate a new submission ID.
 * 
 * Format: submission_{timestamp}_{random}
 */
function generateSubmissionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `submission_${timestamp}_${random}`;
}

/**
 * Executes checklist.submit command logic.
 * 
 * Creates the ChecklistSubmissionRecord with all required data.
 */
export async function executeChecklistSubmit(
    context: ChecklistSubmitExecutionContext
): Promise<ChecklistSubmitExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;

    if (!command || !identity) {
        const failure = createPipelineFailure(
            'EXECUTION',
            'INTERNAL_ERROR',
            'Command or identity not found in context'
        );
        return { ...context, currentStage: 'EXECUTION', failure };
    }

    const payload = command.payload;
    const now = Date.now();

    // Create submission record
    const submissionRecord: ChecklistSubmissionRecord = {
        submissionId: generateSubmissionId(),
        checklistId: payload.checklistId,
        companyId: identity.companyId,
        userId: identity.uid,
        status: 'SUBMITTED',
        answers: payload.answers,
        submittedAt: now,
        sourceCommandId: command.commandId,
        ...(payload.notes !== undefined && { notes: payload.notes })
    };

    // Prepare receipt
    const receipt: ChecklistSubmitReceipt = {
        submissionId: submissionRecord.submissionId,
        checklistId: submissionRecord.checklistId,
        submittedAt: submissionRecord.submittedAt,
        answerCount: submissionRecord.answers.length
    };

    return {
        ...context,
        currentStage: 'EXECUTION',
        submissionRecord,
        receipt
    };
}

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Persists the checklist submission to Firestore.
 */
export async function persistChecklistSubmission(
    context: ChecklistSubmitExecutionContext,
    deps?: ChecklistSubmitDependencies
): Promise<ChecklistSubmitExecutionContext> {
    const submissionRecord = context.submissionRecord;

    if (!submissionRecord) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            'Submission record not found in context'
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    const store = deps?.checklistStore ?? getChecklistStore();

    try {
        await store.createSubmission(submissionRecord);
    } catch (error) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            `Failed to persist checklist submission: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    return {
        ...context,
        currentStage: 'PERSISTENCE'
    };
}

// ============================================================================
// AUDIT EMISSION
// ============================================================================

/**
 * Emits audit record for checklist.submit command.
 */
export async function emitChecklistSubmitAudit(
    context: ChecklistSubmitExecutionContext,
    deps?: ChecklistSubmitDependencies
): Promise<ChecklistSubmitExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const submissionRecord = context.submissionRecord;

    if (!command || !identity || !submissionRecord) {
        const failure = createPipelineFailure(
            'AUDIT_EMISSION',
            'INTERNAL_ERROR',
            'Required data not found in context for audit'
        );
        return { ...context, currentStage: 'AUDIT_EMISSION', failure };
    }

    const auditRecord: AuditRecord = {
        auditId: generateAuditId(),
        commandId: command.commandId,
        commandType: command.commandType,
        companyId: identity.companyId,
        userId: identity.uid,
        userRole: identity.role,
        result: 'ACCEPTED',
        timestamp: Date.now(),
        durationMs: Date.now() - context.startedAt,
        context: {
            submissionId: submissionRecord.submissionId,
            checklistId: submissionRecord.checklistId,
            answerCount: submissionRecord.answers.length,
            submittedAt: submissionRecord.submittedAt
        }
    };

    const store = deps?.auditStore ?? getAuditStore();

    try {
        await store.appendAuditRecord(auditRecord);
    } catch (error) {
        // Log but don't fail - audit is important but shouldn't break the command
        console.error('Failed to emit audit record:', error);
    }

    return {
        ...context,
        currentStage: 'AUDIT_EMISSION'
    };
}

// ============================================================================
// COMMAND TYPE CHECK
// ============================================================================

/**
 * Check if a command is checklist.submit.
 */
export function isChecklistSubmitCommand(
    command: DomainCommand
): command is DomainCommand<ChecklistSubmitPayload> {
    return command.commandType === 'checklist.submit';
}
