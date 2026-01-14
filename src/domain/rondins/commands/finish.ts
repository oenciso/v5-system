/**
 * @fileoverview Rondin.Finish Command Handler
 * @module domain/rondins/commands/finish
 * 
 * FASE 3 - PASO 12: TERCER COMANDO DE RONDINES (rondin.finish)
 * 
 * Implementa el comando rondin.finish de extremo a extremo.
 * Sigue la misma plantilla que shift.close.
 * 
 * Flujo completo:
 * 1. PAYLOAD_VALIDATION - Valida rondinId, ubicación y notas opcionales
 * 2. PRECONDITION_CHECK - Rondín existe y está ACTIVO
 * 3. EXECUTION - Prepara datos de finalización
 * 4. PERSISTENCE - Actualiza rondín en Firestore
 * 5. AUDIT_EMISSION - Registra auditoría
 */

import { DomainCommand } from '../../../commands/contracts';
import { CommandExecutionContext, createPipelineFailure } from '../../../commands/pipeline';
import { AuthenticatedIdentity } from '../../../security/auth/types';
import { RondinFinishPayload, RondinFinishReceipt, RondinRecord } from '../types';
import { RondinStore, getRondinStore } from '../store';
import { AuditStore, AuditRecord, getAuditStore, generateAuditId } from '../../../audit/store';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Extended context for rondin.finish execution.
 * 
 * Contains command-specific data accumulated during execution.
 */
export interface RondinFinishExecutionContext extends CommandExecutionContext<RondinFinishPayload> {
    /** The rondin being finished */
    readonly rondin?: RondinRecord;

    /** Finish timestamp */
    readonly finishedAt?: number;

    /** Receipt to return to client (after PERSISTENCE) */
    readonly receipt?: RondinFinishReceipt;
}

/**
 * Dependencies for rondin.finish command handlers.
 */
export interface RondinFinishDependencies {
    readonly rondinStore?: RondinStore | undefined;
    readonly auditStore?: AuditStore | undefined;
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validates the rondin.finish payload.
 * 
 * Validation rules:
 * - rondinId required, non-empty string
 * - location optional, must have valid coordinates if provided
 * - notes optional string
 */
export async function validateRondinFinishPayload(
    context: RondinFinishExecutionContext
): Promise<RondinFinishExecutionContext> {
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

    // Validate rondinId (required, non-empty)
    if (typeof payload.rondinId !== 'string') {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Rondin ID is required and must be a string'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    if (payload.rondinId.trim().length === 0) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Rondin ID cannot be empty'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    // Validate location if provided
    if (payload.location !== undefined) {
        const { latitude, longitude } = payload.location;

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                'Location must have numeric latitude and longitude'
            );
            return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
        }

        if (latitude < -90 || latitude > 90) {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                'Latitude must be between -90 and 90'
            );
            return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
        }

        if (longitude < -180 || longitude > 180) {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                'Longitude must be between -180 and 180'
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
 * Checks rondin.finish preconditions.
 * 
 * Preconditions:
 * - Rondin must exist
 * - Rondin must be ACTIVE
 */
export async function checkRondinFinishPreconditions(
    context: RondinFinishExecutionContext,
    deps?: RondinFinishDependencies
): Promise<RondinFinishExecutionContext> {
    const identity = context.identity;
    const command = context.command;

    if (!identity || identity.kind !== 'authenticated') {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INTERNAL_ERROR',
            'Authenticated identity required for precondition check'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    if (!command) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INTERNAL_ERROR',
            'Command not found in context'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    const store = deps?.rondinStore ?? getRondinStore();
    const rondin = await store.getRondin(identity.companyId, command.payload.rondinId);

    // Rondin must exist
    if (!rondin) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'RESOURCE_NOT_FOUND',
            'Rondin not found'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Rondin must be ACTIVE
    if (rondin.status !== 'ACTIVE') {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INVALID_STATE',
            'Rondin is already finished'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Preconditions met - store the rondin in context for later stages
    return {
        ...context,
        currentStage: 'PRECONDITION_CHECK',
        preconditionsMet: true,
        rondin
    };
}

// ============================================================================
// EXECUTION
// ============================================================================

/**
 * Executes rondin.finish command logic.
 * 
 * Prepares the finish data and receipt.
 */
export async function executeRondinFinish(
    context: RondinFinishExecutionContext
): Promise<RondinFinishExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const rondin = context.rondin;

    if (!command || !identity || !rondin) {
        const failure = createPipelineFailure(
            'EXECUTION',
            'INTERNAL_ERROR',
            'Command, identity, or rondin not found in context'
        );
        return { ...context, currentStage: 'EXECUTION', failure };
    }

    const finishedAt = Date.now();
    const durationMs = finishedAt - rondin.startedAt;

    // Prepare receipt
    const receipt: RondinFinishReceipt = {
        rondinId: rondin.rondinId,
        finishedAt,
        durationMs
    };

    return {
        ...context,
        currentStage: 'EXECUTION',
        finishedAt,
        receipt
    };
}

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Persists the rondin finish to Firestore.
 */
export async function persistRondinFinish(
    context: RondinFinishExecutionContext,
    deps?: RondinFinishDependencies
): Promise<RondinFinishExecutionContext> {
    const command = context.command;
    const rondin = context.rondin;
    const finishedAt = context.finishedAt;

    if (!command || !rondin || finishedAt === undefined) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            'Required data not found in context for persistence'
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    const store = deps?.rondinStore ?? getRondinStore();
    const payload = command.payload;

    try {
        await store.finishRondin(
            rondin.companyId,
            rondin.rondinId,
            {
                finishedAt,
                finishCommandId: command.commandId,
                ...(payload.location !== undefined && { finishLocation: payload.location }),
                ...(payload.notes !== undefined && { finishNotes: payload.notes })
            }
        );
    } catch (error) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            `Failed to finish rondin: ${error instanceof Error ? error.message : 'Unknown error'}`
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
 * Emits audit record for rondin.finish command.
 */
export async function emitRondinFinishAudit(
    context: RondinFinishExecutionContext,
    deps?: RondinFinishDependencies
): Promise<RondinFinishExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const rondin = context.rondin;
    const receipt = context.receipt;

    if (!command || !identity || !rondin || !receipt) {
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
            rondinId: rondin.rondinId,
            routeId: rondin.routeId,
            finishedAt: receipt.finishedAt,
            rondinDurationMs: receipt.durationMs,
            hasFinishLocation: command.payload.location !== undefined
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
 * Check if a command is rondin.finish.
 */
export function isRondinFinishCommand(
    command: DomainCommand
): command is DomainCommand<RondinFinishPayload> {
    return command.commandType === 'rondin.finish';
}
