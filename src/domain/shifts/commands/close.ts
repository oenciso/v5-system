/**
 * @fileoverview Shift.Close Command Handler
 * @module domain/shifts/commands/close
 * 
 * FASE 3 - PASO 7: SEGUNDO COMANDO REAL (shift.close)
 * 
 * Implementa el comando shift.close de extremo a extremo.
 * Sigue la misma plantilla que shift.open.
 * 
 * Flujo completo:
 * 1. PAYLOAD_VALIDATION - Valida payload de cierre
 * 2. PRECONDITION_CHECK - Usuario tiene turno activo que le pertenece
 * 3. EXECUTION - Prepara datos de cierre
 * 4. PERSISTENCE - Actualiza turno en Firestore
 * 5. AUDIT_EMISSION - Registra auditoría
 */

import { DomainCommand } from '../../../commands/contracts';
import { CommandExecutionContext, createPipelineFailure } from '../../../commands/pipeline';
import { AuthenticatedIdentity } from '../../../security/auth/types';
import { ShiftClosePayload, ShiftCloseReceipt, ShiftRecord } from '../types';
import { ShiftStore, getShiftStore } from '../store';
import { AuditStore, AuditRecord, getAuditStore, generateAuditId } from '../../../audit/store';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Extended context for shift.close execution.
 * 
 * Contains command-specific data accumulated during execution.
 */
export interface ShiftCloseExecutionContext extends CommandExecutionContext<ShiftClosePayload> {
    /** The active shift being closed */
    readonly activeShift?: ShiftRecord;

    /** Close timestamp */
    readonly closedAt?: number;

    /** Receipt to return to client (after PERSISTENCE) */
    readonly receipt?: ShiftCloseReceipt;
}

/**
 * Dependencies for shift.close command handlers.
 */
export interface ShiftCloseDependencies {
    readonly shiftStore?: ShiftStore | undefined;
    readonly auditStore?: AuditStore | undefined;
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validates the shift.close payload.
 * 
 * Validation rules:
 * - Payload can be empty (location and notes are optional)
 * - If location provided, must have valid coordinates
 * - Notes must be string if provided
 */
export async function validateShiftClosePayload(
    context: ShiftCloseExecutionContext
): Promise<ShiftCloseExecutionContext> {
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
 * Checks shift.close preconditions.
 * 
 * Preconditions:
 * - User MUST have an active shift
 * - The shift MUST belong to the same user
 */
export async function checkShiftClosePreconditions(
    context: ShiftCloseExecutionContext,
    deps?: ShiftCloseDependencies
): Promise<ShiftCloseExecutionContext> {
    const identity = context.identity;

    if (!identity || identity.kind !== 'authenticated') {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INTERNAL_ERROR',
            'Authenticated identity required for precondition check'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    const store = deps?.shiftStore ?? getShiftStore();
    const activeShiftQuery = await store.getActiveShiftForUser(
        identity.companyId,
        identity.uid
    );

    // User must have an active shift
    if (!activeShiftQuery.hasActiveShift) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INVALID_STATE',
            'User does not have an active shift to close'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    const activeShift = activeShiftQuery.shift;

    // The shift must belong to the same user (extra safety check)
    if (activeShift.userId !== identity.uid) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'FORBIDDEN',
            'Cannot close a shift that belongs to another user'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Preconditions met - store the active shift in context for later stages
    return {
        ...context,
        currentStage: 'PRECONDITION_CHECK',
        preconditionsMet: true,
        activeShift
    };
}

// ============================================================================
// EXECUTION
// ============================================================================

/**
 * Executes shift.close command logic.
 * 
 * Prepares the close data and receipt.
 */
export async function executeShiftClose(
    context: ShiftCloseExecutionContext
): Promise<ShiftCloseExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const activeShift = context.activeShift;

    if (!command || !identity || !activeShift) {
        const failure = createPipelineFailure(
            'EXECUTION',
            'INTERNAL_ERROR',
            'Command, identity, or active shift not found in context'
        );
        return { ...context, currentStage: 'EXECUTION', failure };
    }

    const closedAt = Date.now();
    const durationMs = closedAt - activeShift.openedAt;

    // Prepare receipt
    const receipt: ShiftCloseReceipt = {
        shiftId: activeShift.shiftId,
        closedAt,
        durationMs
    };

    return {
        ...context,
        currentStage: 'EXECUTION',
        closedAt,
        receipt
    };
}

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Persists the shift close to Firestore.
 */
export async function persistShiftClose(
    context: ShiftCloseExecutionContext,
    deps?: ShiftCloseDependencies
): Promise<ShiftCloseExecutionContext> {
    const command = context.command;
    const activeShift = context.activeShift;
    const closedAt = context.closedAt;

    if (!command || !activeShift || closedAt === undefined) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            'Required data not found in context for persistence'
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    const store = deps?.shiftStore ?? getShiftStore();
    const payload = command.payload;

    try {
        await store.closeShift(
            activeShift.companyId,
            activeShift.shiftId,
            {
                closedAt,
                closeCommandId: command.commandId,
                ...(payload.location !== undefined && { closeLocation: payload.location }),
                ...(payload.notes !== undefined && { closeNotes: payload.notes })
            }
        );
    } catch (error) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            `Failed to close shift: ${error instanceof Error ? error.message : 'Unknown error'}`
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
 * Emits audit record for shift.close command.
 */
export async function emitShiftCloseAudit(
    context: ShiftCloseExecutionContext,
    deps?: ShiftCloseDependencies
): Promise<ShiftCloseExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const activeShift = context.activeShift;
    const receipt = context.receipt;

    if (!command || !identity || !activeShift || !receipt) {
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
            shiftId: activeShift.shiftId,
            closedAt: receipt.closedAt,
            shiftDurationMs: receipt.durationMs
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
 * Check if a command is shift.close.
 */
export function isShiftCloseCommand(
    command: DomainCommand
): command is DomainCommand<ShiftClosePayload> {
    return command.commandType === 'shift.close';
}
