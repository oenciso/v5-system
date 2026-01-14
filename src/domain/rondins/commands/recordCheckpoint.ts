/**
 * @fileoverview Rondin.RecordCheckpoint Command Handler
 * @module domain/rondins/commands/recordCheckpoint
 * 
 * FASE 3 - PASO 11: SEGUNDO COMANDO DE RONDINES (rondin.recordCheckpoint)
 * 
 * Implementa el comando rondin.recordCheckpoint de extremo a extremo.
 * Registra un checkpoint durante un rondín ACTIVO.
 * 
 * Flujo completo:
 * 1. PAYLOAD_VALIDATION - Valida rondinId, checkpointId, scannedAt, location
 * 2. PRECONDITION_CHECK - Rondín existe, está ACTIVO, checkpoint no duplicado
 * 3. EXECUTION - Crea RondinCheckpointRecord
 * 4. PERSISTENCE - Escribe a Firestore
 * 5. AUDIT_EMISSION - Registra auditoría
 */

import { DomainCommand } from '../../../commands/contracts';
import { CommandExecutionContext, createPipelineFailure } from '../../../commands/pipeline';
import { AuthenticatedIdentity } from '../../../security/auth/types';
import {
    RondinRecordCheckpointPayload,
    RondinRecordCheckpointReceipt,
    RondinCheckpointRecord,
    RondinRecord
} from '../types';
import { RondinStore, getRondinStore } from '../store';
import { AuditStore, AuditRecord, getAuditStore, generateAuditId } from '../../../audit/store';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Extended context for rondin.recordCheckpoint execution.
 * 
 * Contains command-specific data accumulated during execution.
 */
export interface RondinRecordCheckpointExecutionContext extends CommandExecutionContext<RondinRecordCheckpointPayload> {
    /** The rondin being updated */
    readonly rondin?: RondinRecord;

    /** Generated checkpoint record (after EXECUTION) */
    readonly checkpointRecord?: RondinCheckpointRecord;

    /** Receipt to return to client (after PERSISTENCE) */
    readonly receipt?: RondinRecordCheckpointReceipt;
}

/**
 * Dependencies for rondin.recordCheckpoint command handlers.
 */
export interface RondinRecordCheckpointDependencies {
    readonly rondinStore?: RondinStore | undefined;
    readonly auditStore?: AuditStore | undefined;
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validates the rondin.recordCheckpoint payload.
 * 
 * Validation rules:
 * - rondinId required, non-empty string
 * - checkpointId required, non-empty string
 * - scannedAt optional, must be valid timestamp if provided
 * - location optional, must have valid coordinates if provided
 */
export async function validateRondinRecordCheckpointPayload(
    context: RondinRecordCheckpointExecutionContext
): Promise<RondinRecordCheckpointExecutionContext> {
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

    // Validate checkpointId (required, non-empty)
    if (typeof payload.checkpointId !== 'string') {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Checkpoint ID is required and must be a string'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    if (payload.checkpointId.trim().length === 0) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Checkpoint ID cannot be empty'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    // Validate scannedAt if provided
    if (payload.scannedAt !== undefined) {
        if (typeof payload.scannedAt !== 'number' || payload.scannedAt <= 0) {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                'Scanned timestamp must be a positive number'
            );
            return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
        }
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
 * Checks rondin.recordCheckpoint preconditions.
 * 
 * Preconditions:
 * - Rondin must exist
 * - Rondin must be ACTIVE
 * - Checkpoint must not already be recorded for this rondin
 */
export async function checkRondinRecordCheckpointPreconditions(
    context: RondinRecordCheckpointExecutionContext,
    deps?: RondinRecordCheckpointDependencies
): Promise<RondinRecordCheckpointExecutionContext> {
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
    const payload = command.payload;

    // Check rondin exists
    const rondin = await store.getRondin(identity.companyId, payload.rondinId);

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
            'Rondin is not active'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Checkpoint must not already exist
    const checkpointExists = await store.checkpointExists(
        identity.companyId,
        payload.rondinId,
        payload.checkpointId
    );

    if (checkpointExists) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INVALID_STATE',
            'Checkpoint already recorded for this rondin'
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
 * Executes rondin.recordCheckpoint command logic.
 * 
 * Creates the RondinCheckpointRecord with all required data.
 */
export async function executeRondinRecordCheckpoint(
    context: RondinRecordCheckpointExecutionContext
): Promise<RondinRecordCheckpointExecutionContext> {
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

    const payload = command.payload;
    const scannedAt = payload.scannedAt ?? Date.now();

    // Create checkpoint record
    const checkpointRecord: RondinCheckpointRecord = {
        rondinId: rondin.rondinId,
        checkpointId: payload.checkpointId,
        companyId: identity.companyId,
        userId: identity.uid,
        scannedAt,
        sourceCommandId: command.commandId,
        ...(payload.location !== undefined && { location: payload.location })
    };

    // Prepare receipt
    const receipt: RondinRecordCheckpointReceipt = {
        rondinId: rondin.rondinId,
        checkpointId: checkpointRecord.checkpointId,
        scannedAt: checkpointRecord.scannedAt
    };

    return {
        ...context,
        currentStage: 'EXECUTION',
        checkpointRecord,
        receipt
    };
}

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Persists the checkpoint record to Firestore.
 */
export async function persistRondinCheckpoint(
    context: RondinRecordCheckpointExecutionContext,
    deps?: RondinRecordCheckpointDependencies
): Promise<RondinRecordCheckpointExecutionContext> {
    const checkpointRecord = context.checkpointRecord;

    if (!checkpointRecord) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            'Checkpoint record not found in context'
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    const store = deps?.rondinStore ?? getRondinStore();

    try {
        await store.createCheckpoint(checkpointRecord);
    } catch (error) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            `Failed to persist checkpoint: ${error instanceof Error ? error.message : 'Unknown error'}`
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
 * Emits audit record for rondin.recordCheckpoint command.
 */
export async function emitRondinRecordCheckpointAudit(
    context: RondinRecordCheckpointExecutionContext,
    deps?: RondinRecordCheckpointDependencies
): Promise<RondinRecordCheckpointExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const checkpointRecord = context.checkpointRecord;
    const rondin = context.rondin;

    if (!command || !identity || !checkpointRecord || !rondin) {
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
            checkpointId: checkpointRecord.checkpointId,
            scannedAt: checkpointRecord.scannedAt,
            hasLocation: checkpointRecord.location !== undefined
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
 * Check if a command is rondin.recordCheckpoint.
 */
export function isRondinRecordCheckpointCommand(
    command: DomainCommand
): command is DomainCommand<RondinRecordCheckpointPayload> {
    return command.commandType === 'rondin.recordCheckpoint';
}
