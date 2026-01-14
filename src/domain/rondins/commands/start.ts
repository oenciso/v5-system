/**
 * @fileoverview Rondin.Start Command Handler
 * @module domain/rondins/commands/start
 * 
 * FASE 3 - PASO 10: PRIMER COMANDO DE RONDINES (rondin.start)
 * 
 * Implementa el comando rondin.start de extremo a extremo.
 * Sigue la misma plantilla que shift.open.
 * 
 * Flujo completo:
 * 1. PAYLOAD_VALIDATION - Valida routeId y ubicación opcional
 * 2. PRECONDITION_CHECK - Usuario tiene turno activo, no tiene rondín activo
 * 3. EXECUTION - Genera RondinRecord
 * 4. PERSISTENCE - Escribe a Firestore
 * 5. AUDIT_EMISSION - Registra auditoría
 */

import { DomainCommand } from '../../../commands/contracts';
import { CommandExecutionContext, createPipelineFailure } from '../../../commands/pipeline';
import { AuthenticatedIdentity } from '../../../security/auth/types';
import { RondinStartPayload, RondinStartReceipt, RondinRecord } from '../types';
import { RondinStore, getRondinStore } from '../store';
import { ShiftStore, getShiftStore } from '../../shifts/store';
import { AuditStore, AuditRecord, getAuditStore, generateAuditId } from '../../../audit/store';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Extended context for rondin.start execution.
 * 
 * Contains command-specific data accumulated during execution.
 */
export interface RondinStartExecutionContext extends CommandExecutionContext<RondinStartPayload> {
    /** Generated rondin record (after EXECUTION) */
    readonly rondinRecord?: RondinRecord;

    /** Receipt to return to client (after PERSISTENCE) */
    readonly receipt?: RondinStartReceipt;
}

/**
 * Dependencies for rondin.start command handlers.
 */
export interface RondinStartDependencies {
    readonly rondinStore?: RondinStore | undefined;
    readonly shiftStore?: ShiftStore | undefined;
    readonly auditStore?: AuditStore | undefined;
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validates the rondin.start payload.
 * 
 * Validation rules:
 * - routeId required, non-empty string
 * - location optional, must have valid coordinates if provided
 */
export async function validateRondinStartPayload(
    context: RondinStartExecutionContext
): Promise<RondinStartExecutionContext> {
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

    // Validate routeId (required, non-empty)
    if (typeof payload.routeId !== 'string') {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Route ID is required and must be a string'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    const trimmedRouteId = payload.routeId.trim();
    if (trimmedRouteId.length === 0) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Route ID cannot be empty'
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
 * Checks rondin.start preconditions.
 * 
 * Preconditions:
 * - User must be authenticated
 * - User must have an ACTIVE shift
 * - User must NOT have an ACTIVE rondin
 */
export async function checkRondinStartPreconditions(
    context: RondinStartExecutionContext,
    deps?: RondinStartDependencies
): Promise<RondinStartExecutionContext> {
    const identity = context.identity;

    if (!identity || identity.kind !== 'authenticated') {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INTERNAL_ERROR',
            'Authenticated identity required for precondition check'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Check for active shift
    const shiftStore = deps?.shiftStore ?? getShiftStore();
    const activeShiftQuery = await shiftStore.getActiveShiftForUser(
        identity.companyId,
        identity.uid
    );

    if (!activeShiftQuery.hasActiveShift) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INVALID_STATE',
            'User must have an active shift to start a rondin'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Check for active rondin
    const rondinStore = deps?.rondinStore ?? getRondinStore();
    const activeRondinQuery = await rondinStore.getActiveRondinForUser(
        identity.companyId,
        identity.uid
    );

    if (activeRondinQuery.hasActiveRondin) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INVALID_STATE',
            'User already has an active rondin'
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
 * Generate a new rondin ID.
 * 
 * Format: rondin_{timestamp}_{random}
 */
function generateRondinId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `rondin_${timestamp}_${random}`;
}

/**
 * Executes rondin.start command logic.
 * 
 * Creates the RondinRecord with all required data.
 */
export async function executeRondinStart(
    context: RondinStartExecutionContext
): Promise<RondinStartExecutionContext> {
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

    // Create rondin record
    const rondinRecord: RondinRecord = {
        rondinId: generateRondinId(),
        companyId: identity.companyId,
        userId: identity.uid,
        routeId: payload.routeId.trim(),
        status: 'ACTIVE',
        startedAt: now,
        sourceCommandId: command.commandId,
        ...(payload.location !== undefined && { startLocation: payload.location })
    };

    // Prepare receipt
    const receipt: RondinStartReceipt = {
        rondinId: rondinRecord.rondinId,
        routeId: rondinRecord.routeId,
        startedAt: rondinRecord.startedAt
    };

    return {
        ...context,
        currentStage: 'EXECUTION',
        rondinRecord,
        receipt
    };
}

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Persists the rondin record to Firestore.
 */
export async function persistRondin(
    context: RondinStartExecutionContext,
    deps?: RondinStartDependencies
): Promise<RondinStartExecutionContext> {
    const rondinRecord = context.rondinRecord;

    if (!rondinRecord) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            'Rondin record not found in context'
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    const store = deps?.rondinStore ?? getRondinStore();

    try {
        await store.createRondin(rondinRecord);
    } catch (error) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            `Failed to persist rondin: ${error instanceof Error ? error.message : 'Unknown error'}`
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
 * Emits audit record for rondin.start command.
 */
export async function emitRondinStartAudit(
    context: RondinStartExecutionContext,
    deps?: RondinStartDependencies
): Promise<RondinStartExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const rondinRecord = context.rondinRecord;

    if (!command || !identity || !rondinRecord) {
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
            rondinId: rondinRecord.rondinId,
            routeId: rondinRecord.routeId,
            startedAt: rondinRecord.startedAt,
            hasStartLocation: rondinRecord.startLocation !== undefined
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
 * Check if a command is rondin.start.
 */
export function isRondinStartCommand(
    command: DomainCommand
): command is DomainCommand<RondinStartPayload> {
    return command.commandType === 'rondin.start';
}
