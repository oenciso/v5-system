/**
 * @fileoverview Shift.Open Command Handler
 * @module domain/shifts/commands/open
 * 
 * FASE 3 - PASO 6: PRIMER COMANDO REAL (shift.open)
 * 
 * Implementa el comando shift.open de extremo a extremo.
 * Este es el ejemplo de referencia para todos los comandos futuros.
 * 
 * Flujo completo:
 * 1. PAYLOAD_VALIDATION - Valida payload de apertura
 * 2. PRECONDITION_CHECK - Usuario no tiene turno activo
 * 3. EXECUTION - Genera ShiftRecord
 * 4. PERSISTENCE - Escribe a Firestore
 * 5. AUDIT_EMISSION - Registra auditoría
 */

import { DomainCommand } from '../../../commands/contracts';
import { CommandExecutionContext, createPipelineFailure } from '../../../commands/pipeline';
import { AuthenticatedIdentity } from '../../../security/auth/types';
import { ShiftOpenPayload, ShiftOpenReceipt, ShiftRecord } from '../types';
import { ShiftStore, getShiftStore } from '../store';
import { AuditStore, AuditRecord, getAuditStore, generateAuditId } from '../../../audit/store';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Extended context for shift.open execution.
 * 
 * Contains command-specific data accumulated during execution.
 */
export interface ShiftOpenExecutionContext extends CommandExecutionContext<ShiftOpenPayload> {
    /** Generated shift record (after EXECUTION) */
    readonly shiftRecord?: ShiftRecord;

    /** Receipt to return to client (after PERSISTENCE) */
    readonly receipt?: ShiftOpenReceipt;
}

/**
 * Dependencies for shift.open command handlers.
 */
export interface ShiftOpenDependencies {
    readonly shiftStore?: ShiftStore | undefined;
    readonly auditStore?: AuditStore | undefined;
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validates the shift.open payload.
 * 
 * Validation rules:
 * - Payload can be empty (location and notes are optional)
 * - If location provided, must have valid coordinates
 * - Notes must be string if provided
 */
export async function validateShiftOpenPayload(
    context: ShiftOpenExecutionContext
): Promise<ShiftOpenExecutionContext> {
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
 * Checks shift.open preconditions.
 * 
 * Preconditions:
 * - User must NOT have an active shift
 */
export async function checkShiftOpenPreconditions(
    context: ShiftOpenExecutionContext,
    deps?: ShiftOpenDependencies
): Promise<ShiftOpenExecutionContext> {
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
    const activeShift = await store.getActiveShiftForUser(
        identity.companyId,
        identity.uid
    );

    if (activeShift.hasActiveShift) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INVALID_STATE',
            `User already has an active shift: ${activeShift.shift.shiftId}`
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Preconditions met
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
 * Generate a new shift ID.
 * 
 * Format: shift_{timestamp}_{random}
 */
function generateShiftId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `shift_${timestamp}_${random}`;
}

/**
 * Executes shift.open command logic.
 * 
 * Creates the ShiftRecord with all required data.
 */
export async function executeShiftOpen(
    context: ShiftOpenExecutionContext
): Promise<ShiftOpenExecutionContext> {
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

    // Create shift record
    const shiftRecord: ShiftRecord = {
        shiftId: generateShiftId(),
        userId: identity.uid,
        companyId: identity.companyId,
        status: 'ACTIVE',
        openedAt: now,
        sourceCommandId: command.commandId,
        ...(payload.location !== undefined && { openLocation: payload.location }),
        ...(payload.notes !== undefined && { openNotes: payload.notes })
    };

    // Prepare receipt
    const receipt: ShiftOpenReceipt = {
        shiftId: shiftRecord.shiftId,
        openedAt: shiftRecord.openedAt
    };

    return {
        ...context,
        currentStage: 'EXECUTION',
        shiftRecord,
        receipt
    };
}

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Persists the shift record to Firestore.
 */
export async function persistShift(
    context: ShiftOpenExecutionContext,
    deps?: ShiftOpenDependencies
): Promise<ShiftOpenExecutionContext> {
    const shiftRecord = context.shiftRecord;

    if (!shiftRecord) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            'Shift record not found in context'
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    const store = deps?.shiftStore ?? getShiftStore();

    try {
        await store.createShift(shiftRecord);
    } catch (error) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            `Failed to persist shift: ${error instanceof Error ? error.message : 'Unknown error'}`
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
 * Emits audit record for shift.open command.
 */
export async function emitShiftOpenAudit(
    context: ShiftOpenExecutionContext,
    deps?: ShiftOpenDependencies
): Promise<ShiftOpenExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const shiftRecord = context.shiftRecord;

    if (!command || !identity || !shiftRecord) {
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
            shiftId: shiftRecord.shiftId,
            openedAt: shiftRecord.openedAt
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
 * Check if a command is shift.open.
 */
export function isShiftOpenCommand(
    command: DomainCommand
): command is DomainCommand<ShiftOpenPayload> {
    return command.commandType === 'shift.open';
}
