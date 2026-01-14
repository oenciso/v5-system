/**
 * @fileoverview Incident Domain Types and Contracts
 * @module domain/incidents/types
 * 
 * FASE 3 - PASO 8: PRIMER COMANDO DE INCIDENTES (incident.create)
 * 
 * Define los tipos de dominio para incidentes.
 * Sigue el mismo patrón que shifts.
 */

import { UserId, CompanyId } from '../../security/auth/types';

// ============================================================================
// INCIDENT TYPES
// ============================================================================

/**
 * Unique identifier for an incident.
 */
export type IncidentId = string;

/**
 * Status of an incident.
 */
export type IncidentStatus = 'OPEN' | 'CLOSED';

/**
 * Severity levels for incidents.
 * 
 * Canonical severity levels from SISTEMA_CANONICO.
 */
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Valid severity values array for validation.
 */
export const INCIDENT_SEVERITY_VALUES: readonly IncidentSeverity[] = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
] as const;

/**
 * Type guard for IncidentSeverity.
 */
export function isValidSeverity(value: unknown): value is IncidentSeverity {
    return typeof value === 'string' &&
        INCIDENT_SEVERITY_VALUES.includes(value as IncidentSeverity);
}

/**
 * Location coordinates.
 */
export interface GeoLocation {
    readonly latitude: number;
    readonly longitude: number;
}

/**
 * An incident record stored in Firestore.
 * 
 * Collection: companies/{companyId}/incidents/{incidentId}
 */
export interface IncidentRecord {
    /** Unique incident identifier */
    readonly incidentId: IncidentId;

    /** User who created the incident */
    readonly reporterId: UserId;

    /** Company the incident belongs to */
    readonly companyId: CompanyId;

    /** Current status of the incident */
    readonly status: IncidentStatus;

    /** Title of the incident (required) */
    readonly title: string;

    /** Description of the incident (optional) */
    readonly description?: string;

    /** Severity level */
    readonly severity: IncidentSeverity;

    /** Location where incident occurred (optional) */
    readonly location?: GeoLocation;

    /** Timestamp when incident was created (Unix ms) */
    readonly createdAt: number;

    /** Timestamp when incident was closed (Unix ms, undefined if OPEN) */
    readonly closedAt?: number;

    /** Command ID that created this incident (for idempotency tracing) */
    readonly sourceCommandId: string;

    /** Command ID that closed this incident */
    readonly closeCommandId?: string;

    /** Notes when closing the incident */
    readonly closeNotes?: string;

    /** References to attached evidence (file paths or IDs) */
    readonly evidenceRefs?: readonly string[];
}

// ============================================================================
// INCIDENT.CREATE PAYLOAD
// ============================================================================

/**
 * Payload for incident.create command.
 */
export interface IncidentCreatePayload {
    /** Title of the incident (required, non-empty) */
    readonly title: string;

    /** Description of the incident (optional) */
    readonly description?: string;

    /** Severity level (required) */
    readonly severity: IncidentSeverity;

    /** Location where incident occurred (optional) */
    readonly location?: GeoLocation;

    /** Optional evidence references (IDs or paths) */
    readonly evidenceRefs?: readonly string[];
}

/**
 * Receipt returned after incident.create command succeeds.
 */
export interface IncidentCreateReceipt {
    /** ID of the created incident */
    readonly incidentId: IncidentId;

    /** Timestamp when incident was created */
    readonly createdAt: number;

    /** Severity level assigned */
    readonly severity: IncidentSeverity;
}

// ============================================================================
// INCIDENT.CLOSE PAYLOAD
// ============================================================================

/**
 * Payload for incident.close command.
 */
export interface IncidentClosePayload {
    /** ID of the incident to close (required) */
    readonly incidentId: IncidentId;

    /** Optional notes when closing the incident */
    readonly notes?: string;
}

/**
 * Receipt returned after incident.close command succeeds.
 */
export interface IncidentCloseReceipt {
    /** ID of the closed incident */
    readonly incidentId: IncidentId;

    /** Timestamp when incident was closed */
    readonly closedAt: number;

    /** Duration of the incident in milliseconds */
    readonly durationMs: number;
}

