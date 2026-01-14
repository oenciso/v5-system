/**
 * @fileoverview Rondin Domain Types and Contracts
 * @module domain/rondins/types
 * 
 * FASE 3 - PASO 10: PRIMER COMANDO DE RONDINES (rondin.start)
 * 
 * Define los tipos de dominio para rondines.
 * Sigue el mismo patrón que shifts e incidents.
 */

import { UserId, CompanyId } from '../../security/auth/types';

// ============================================================================
// RONDIN TYPES
// ============================================================================

/**
 * Unique identifier for a rondin.
 */
export type RondinId = string;

/**
 * Unique identifier for a route.
 */
export type RouteId = string;

/**
 * Status of a rondin.
 */
export type RondinStatus = 'ACTIVE' | 'FINISHED';

/**
 * Location coordinates.
 */
export interface GeoLocation {
    readonly latitude: number;
    readonly longitude: number;
}

/**
 * A rondin record stored in Firestore.
 * 
 * Collection: companies/{companyId}/rondins/{rondinId}
 */
export interface RondinRecord {
    /** Unique rondin identifier */
    readonly rondinId: RondinId;

    /** Company the rondin belongs to */
    readonly companyId: CompanyId;

    /** User performing the rondin */
    readonly userId: UserId;

    /** Route being followed */
    readonly routeId: RouteId;

    /** Current status of the rondin */
    readonly status: RondinStatus;

    /** Timestamp when rondin was started (Unix ms) */
    readonly startedAt: number;

    /** Timestamp when rondin was finished (Unix ms, undefined if ACTIVE) */
    readonly finishedAt?: number;

    /** Location where rondin was started (optional) */
    readonly startLocation?: GeoLocation;

    /** Command ID that created this rondin (for idempotency tracing) */
    readonly sourceCommandId: string;
}

// ============================================================================
// RONDIN.START PAYLOAD
// ============================================================================

/**
 * Payload for rondin.start command.
 */
export interface RondinStartPayload {
    /** ID of the route to follow (required) */
    readonly routeId: RouteId;

    /** Location where rondin is started (optional) */
    readonly location?: GeoLocation;
}

/**
 * Receipt returned after rondin.start command succeeds.
 */
export interface RondinStartReceipt {
    /** ID of the created rondin */
    readonly rondinId: RondinId;

    /** ID of the route being followed */
    readonly routeId: RouteId;

    /** Timestamp when rondin was started */
    readonly startedAt: number;
}

// ============================================================================
// RONDIN QUERY RESULT
// ============================================================================

/**
 * Result of querying for active rondin.
 */
export type ActiveRondinQuery =
    | { hasActiveRondin: true; rondin: RondinRecord }
    | { hasActiveRondin: false };
