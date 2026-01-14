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

    /** Location where rondin was finished (optional) */
    readonly finishLocation?: GeoLocation;

    /** Notes when finishing the rondin */
    readonly finishNotes?: string;

    /** Command ID that created this rondin (for idempotency tracing) */
    readonly sourceCommandId: string;

    /** Command ID that finished this rondin */
    readonly finishCommandId?: string;
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

// ============================================================================
// CHECKPOINT TYPES
// ============================================================================

/**
 * Unique identifier for a checkpoint.
 */
export type CheckpointId = string;

/**
 * A checkpoint record stored in Firestore.
 * 
 * Collection: companies/{companyId}/rondins/{rondinId}/checkpoints/{checkpointId}
 */
export interface RondinCheckpointRecord {
    /** ID of the rondin this checkpoint belongs to */
    readonly rondinId: RondinId;

    /** Unique checkpoint identifier */
    readonly checkpointId: CheckpointId;

    /** Company the checkpoint belongs to */
    readonly companyId: CompanyId;

    /** User who scanned the checkpoint */
    readonly userId: UserId;

    /** Timestamp when checkpoint was scanned (Unix ms) */
    readonly scannedAt: number;

    /** Location where checkpoint was scanned (optional) */
    readonly location?: GeoLocation;

    /** Command ID that created this record (for idempotency tracing) */
    readonly sourceCommandId: string;
}

// ============================================================================
// RONDIN.RECORDCHECKPOINT PAYLOAD
// ============================================================================

/**
 * Payload for rondin.recordCheckpoint command.
 */
export interface RondinRecordCheckpointPayload {
    /** ID of the rondin (required) */
    readonly rondinId: RondinId;

    /** ID of the checkpoint being recorded (required) */
    readonly checkpointId: CheckpointId;

    /** Timestamp when checkpoint was scanned (optional, defaults to now) */
    readonly scannedAt?: number;

    /** Location where checkpoint was scanned (optional) */
    readonly location?: GeoLocation;
}

/**
 * Receipt returned after rondin.recordCheckpoint command succeeds.
 */
export interface RondinRecordCheckpointReceipt {
    /** ID of the rondin */
    readonly rondinId: RondinId;

    /** ID of the checkpoint recorded */
    readonly checkpointId: CheckpointId;

    /** Timestamp when checkpoint was scanned */
    readonly scannedAt: number;
}

// ============================================================================
// RONDIN.FINISH PAYLOAD
// ============================================================================

/**
 * Payload for rondin.finish command.
 */
export interface RondinFinishPayload {
    /** ID of the rondin to finish (required) */
    readonly rondinId: RondinId;

    /** Location where rondin is finished (optional) */
    readonly location?: GeoLocation;

    /** Notes when finishing the rondin (optional) */
    readonly notes?: string;
}

/**
 * Receipt returned after rondin.finish command succeeds.
 */
export interface RondinFinishReceipt {
    /** ID of the finished rondin */
    readonly rondinId: RondinId;

    /** Timestamp when rondin was finished */
    readonly finishedAt: number;

    /** Duration of the rondin in milliseconds */
    readonly durationMs: number;
}

