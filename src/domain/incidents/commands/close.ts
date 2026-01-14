/**
 * @fileoverview Incident.Close Command Handler
 * @module domain/incidents/commands/close
 * 
 * FASE 3 - PASO 9: SEGUNDO COMANDO DE INCIDENTES (incident.close)
 * 
 * Implementa el comando incident.close de extremo a extremo.
 * Sigue la misma plantilla que shift.close.
 * 
 * Flujo completo:
 * 1. PAYLOAD_VALIDATION - Valida incidentId y notas opcionales
 * 2. PRECONDITION_CHECK - Incidente existe y está OPEN
 * 3. EXECUTION - Prepara datos de cierre
 * 4. PERSISTENCE - Actualiza incidente en Firestore
 * 5. AUDIT_EMISSION - Registra auditoría
 */

import { DomainCommand } from '../../../commands/contracts';
import { CommandExecutionContext, createPipelineFailure } from '../../../commands/pipeline';
import { AuthenticatedIdentity } from '../../../security/auth/types';
import { IncidentClosePayload, IncidentCloseReceipt, IncidentRecord } from '../types';
import { IncidentStore, getIncidentStore } from '../store';
import { AuditStore, AuditRecord, getAuditStore, generateAuditId } from '../../../audit/store';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Extended context for incident.close execution.
 * 
 * Contains command-specific data accumulated during execution.
 */
export interface IncidentCloseExecutionContext extends CommandExecutionContext<IncidentClosePayload> {
    /** The incident being closed */
    readonly incident?: IncidentRecord;

    /** Close timestamp */
    readonly closedAt?: number;

    /** Receipt to return to client (after PERSISTENCE) */
    readonly receipt?: IncidentCloseReceipt;
}

/**
 * Dependencies for incident.close command handlers.
 */
export interface IncidentCloseDependencies {
    readonly incidentStore?: IncidentStore | undefined;
    readonly auditStore?: AuditStore | undefined;
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validates the incident.close payload.
 * 
 * Validation rules:
 * - incidentId required, non-empty string
 * - notes optional string
 */
export async function validateIncidentClosePayload(
    context: IncidentCloseExecutionContext
): Promise<IncidentCloseExecutionContext> {
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

    // Validate incidentId (required, non-empty)
    if (typeof payload.incidentId !== 'string') {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Incident ID is required and must be a string'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    const trimmedId = payload.incidentId.trim();
    if (trimmedId.length === 0) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Incident ID cannot be empty'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
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
 * Checks incident.close preconditions.
 * 
 * Preconditions:
 * - Incident must exist
 * - Incident must be OPEN
 */
export async function checkIncidentClosePreconditions(
    context: IncidentCloseExecutionContext,
    deps?: IncidentCloseDependencies
): Promise<IncidentCloseExecutionContext> {
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

    const store = deps?.incidentStore ?? getIncidentStore();
    const incident = await store.getIncident(
        identity.companyId,
        command.payload.incidentId
    );

    // Incident must exist
    if (!incident) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'RESOURCE_NOT_FOUND',
            'Incident not found'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Incident must be OPEN
    if (incident.status !== 'OPEN') {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INVALID_STATE',
            'Incident is already closed'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Preconditions met - store the incident in context for later stages
    return {
        ...context,
        currentStage: 'PRECONDITION_CHECK',
        preconditionsMet: true,
        incident
    };
}

// ============================================================================
// EXECUTION
// ============================================================================

/**
 * Executes incident.close command logic.
 * 
 * Prepares the close data and receipt.
 */
export async function executeIncidentClose(
    context: IncidentCloseExecutionContext
): Promise<IncidentCloseExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const incident = context.incident;

    if (!command || !identity || !incident) {
        const failure = createPipelineFailure(
            'EXECUTION',
            'INTERNAL_ERROR',
            'Command, identity, or incident not found in context'
        );
        return { ...context, currentStage: 'EXECUTION', failure };
    }

    const closedAt = Date.now();
    const durationMs = closedAt - incident.createdAt;

    // Prepare receipt
    const receipt: IncidentCloseReceipt = {
        incidentId: incident.incidentId,
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
 * Persists the incident close to Firestore.
 */
export async function persistIncidentClose(
    context: IncidentCloseExecutionContext,
    deps?: IncidentCloseDependencies
): Promise<IncidentCloseExecutionContext> {
    const command = context.command;
    const incident = context.incident;
    const closedAt = context.closedAt;

    if (!command || !incident || closedAt === undefined) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            'Required data not found in context for persistence'
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    const store = deps?.incidentStore ?? getIncidentStore();
    const payload = command.payload;

    try {
        await store.closeIncident(
            incident.companyId,
            incident.incidentId,
            {
                closedAt,
                closeCommandId: command.commandId,
                ...(payload.notes !== undefined && { closeNotes: payload.notes })
            }
        );
    } catch (error) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            `Failed to close incident: ${error instanceof Error ? error.message : 'Unknown error'}`
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
 * Emits audit record for incident.close command.
 */
export async function emitIncidentCloseAudit(
    context: IncidentCloseExecutionContext,
    deps?: IncidentCloseDependencies
): Promise<IncidentCloseExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const incident = context.incident;
    const receipt = context.receipt;

    if (!command || !identity || !incident || !receipt) {
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
            incidentId: incident.incidentId,
            closedAt: receipt.closedAt,
            incidentDurationMs: receipt.durationMs,
            severity: incident.severity
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
 * Check if a command is incident.close.
 */
export function isIncidentCloseCommand(
    command: DomainCommand
): command is DomainCommand<IncidentClosePayload> {
    return command.commandType === 'incident.close';
}
