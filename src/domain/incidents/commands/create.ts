/**
 * @fileoverview Incident.Create Command Handler
 * @module domain/incidents/commands/create
 * 
 * FASE 3 - PASO 8: PRIMER COMANDO DE INCIDENTES (incident.create)
 * 
 * Implementa el comando incident.create de extremo a extremo.
 * Sigue la misma plantilla que shift.open.
 * 
 * Flujo completo:
 * 1. PAYLOAD_VALIDATION - Valida título, severidad, ubicación
 * 2. PRECONDITION_CHECK - Usuario autenticado (ya verificado por security)
 * 3. EXECUTION - Genera IncidentRecord
 * 4. PERSISTENCE - Escribe a Firestore
 * 5. AUDIT_EMISSION - Registra auditoría
 */

import { DomainCommand } from '../../../commands/contracts';
import { CommandExecutionContext, createPipelineFailure } from '../../../commands/pipeline';
import { AuthenticatedIdentity } from '../../../security/auth/types';
import {
    IncidentCreatePayload,
    IncidentCreateReceipt,
    IncidentRecord,
    isValidSeverity
} from '../types';
import { IncidentStore, getIncidentStore } from '../store';
import { AuditStore, AuditRecord, getAuditStore, generateAuditId } from '../../../audit/store';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Extended context for incident.create execution.
 * 
 * Contains command-specific data accumulated during execution.
 */
export interface IncidentCreateExecutionContext extends CommandExecutionContext<IncidentCreatePayload> {
    /** Generated incident record (after EXECUTION) */
    readonly incidentRecord?: IncidentRecord;

    /** Receipt to return to client (after PERSISTENCE) */
    readonly receipt?: IncidentCreateReceipt;
}

/**
 * Dependencies for incident.create command handlers.
 */
export interface IncidentCreateDependencies {
    readonly incidentStore?: IncidentStore | undefined;
    readonly auditStore?: AuditStore | undefined;
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validates the incident.create payload.
 * 
 * Validation rules:
 * - title required, non-empty string
 * - severity required, must be valid enum value
 * - description optional string
 * - location optional, must have valid coordinates if provided
 * - evidenceRefs optional array of strings
 */
export async function validateIncidentCreatePayload(
    context: IncidentCreateExecutionContext
): Promise<IncidentCreateExecutionContext> {
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

    // Validate title (required, non-empty)
    if (typeof payload.title !== 'string') {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Title is required and must be a string'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    const trimmedTitle = payload.title.trim();
    if (trimmedTitle.length === 0) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Title cannot be empty'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    if (trimmedTitle.length > 500) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Title cannot exceed 500 characters'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    // Validate severity (required, must be valid enum)
    if (!isValidSeverity(payload.severity)) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INVALID_PAYLOAD',
            'Severity must be one of: LOW, MEDIUM, HIGH, CRITICAL'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    // Validate description if provided
    if (payload.description !== undefined) {
        if (typeof payload.description !== 'string') {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                'Description must be a string'
            );
            return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
        }

        if (payload.description.length > 5000) {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                'Description cannot exceed 5000 characters'
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

    // Validate evidenceRefs if provided
    if (payload.evidenceRefs !== undefined) {
        if (!Array.isArray(payload.evidenceRefs)) {
            const failure = createPipelineFailure(
                'PAYLOAD_VALIDATION',
                'INVALID_PAYLOAD',
                'Evidence references must be an array'
            );
            return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
        }

        for (const ref of payload.evidenceRefs) {
            if (typeof ref !== 'string' || ref.trim().length === 0) {
                const failure = createPipelineFailure(
                    'PAYLOAD_VALIDATION',
                    'INVALID_PAYLOAD',
                    'Each evidence reference must be a non-empty string'
                );
                return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
            }
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
 * Checks incident.create preconditions.
 * 
 * Preconditions:
 * - User must be authenticated (already enforced by security kernel)
 * - Company must be active (already enforced by security kernel)
 * 
 * Note: Unlike shift.open, there are no domain-specific preconditions.
 * Users can create incidents at any time.
 */
export async function checkIncidentCreatePreconditions(
    context: IncidentCreateExecutionContext,
    _deps?: IncidentCreateDependencies
): Promise<IncidentCreateExecutionContext> {
    const identity = context.identity;

    if (!identity || identity.kind !== 'authenticated') {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INTERNAL_ERROR',
            'Authenticated identity required for precondition check'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // No additional domain preconditions for incident creation
    // Authentication and company active are already verified by security kernel

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
 * Generate a new incident ID.
 * 
 * Format: incident_{timestamp}_{random}
 */
function generateIncidentId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `incident_${timestamp}_${random}`;
}

/**
 * Executes incident.create command logic.
 * 
 * Creates the IncidentRecord with all required data.
 */
export async function executeIncidentCreate(
    context: IncidentCreateExecutionContext
): Promise<IncidentCreateExecutionContext> {
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

    // Create incident record
    const incidentRecord: IncidentRecord = {
        incidentId: generateIncidentId(),
        reporterId: identity.uid,
        companyId: identity.companyId,
        status: 'OPEN',
        title: payload.title.trim(),
        severity: payload.severity,
        createdAt: now,
        sourceCommandId: command.commandId,
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.location !== undefined && { location: payload.location }),
        ...(payload.evidenceRefs !== undefined && payload.evidenceRefs.length > 0 && {
            evidenceRefs: payload.evidenceRefs
        })
    };

    // Prepare receipt
    const receipt: IncidentCreateReceipt = {
        incidentId: incidentRecord.incidentId,
        createdAt: incidentRecord.createdAt,
        severity: incidentRecord.severity
    };

    return {
        ...context,
        currentStage: 'EXECUTION',
        incidentRecord,
        receipt
    };
}

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Persists the incident record to Firestore.
 */
export async function persistIncident(
    context: IncidentCreateExecutionContext,
    deps?: IncidentCreateDependencies
): Promise<IncidentCreateExecutionContext> {
    const incidentRecord = context.incidentRecord;

    if (!incidentRecord) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            'Incident record not found in context'
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    const store = deps?.incidentStore ?? getIncidentStore();

    try {
        await store.createIncident(incidentRecord);
    } catch (error) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            `Failed to persist incident: ${error instanceof Error ? error.message : 'Unknown error'}`
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
 * Emits audit record for incident.create command.
 */
export async function emitIncidentCreateAudit(
    context: IncidentCreateExecutionContext,
    deps?: IncidentCreateDependencies
): Promise<IncidentCreateExecutionContext> {
    const command = context.command;
    const identity = context.identity as AuthenticatedIdentity;
    const incidentRecord = context.incidentRecord;

    if (!command || !identity || !incidentRecord) {
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
            incidentId: incidentRecord.incidentId,
            severity: incidentRecord.severity,
            hasLocation: incidentRecord.location !== undefined,
            hasEvidence: (incidentRecord.evidenceRefs?.length ?? 0) > 0
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
 * Check if a command is incident.create.
 */
export function isIncidentCreateCommand(
    command: DomainCommand
): command is DomainCommand<IncidentCreatePayload> {
    return command.commandType === 'incident.create';
}
