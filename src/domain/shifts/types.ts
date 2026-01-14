/**
 * @fileoverview Shift Domain Types and Contracts
 * @module domain/shifts/types
 * 
 * FASE 3 - PASO 6: PRIMER COMANDO REAL (shift.open)
 * 
 * Define los tipos de dominio para turnos.
 * Este es el módulo de referencia para futuros comandos.
 */

import { UserId, CompanyId } from '../../security/auth/types';

// ============================================================================
// SHIFT TYPES
// ============================================================================

/**
 * Unique identifier for a shift.
 */
export type ShiftId = string;

/**
 * Status of a shift.
 */
export type ShiftStatus = 'ACTIVE' | 'CLOSED';

/**
 * A shift record stored in Firestore.
 * 
 * Collection: companies/{companyId}/shifts/{shiftId}
 */
export interface ShiftRecord {
    /** Unique shift identifier */
    readonly shiftId: ShiftId;

    /** User who opened the shift */
    readonly userId: UserId;

    /** Company the shift belongs to */
    readonly companyId: CompanyId;

    /** Current status of the shift */
    readonly status: ShiftStatus;

    /** Timestamp when shift was opened (Unix ms) */
    readonly openedAt: number;

    /** Timestamp when shift was closed (Unix ms, undefined if ACTIVE) */
    readonly closedAt?: number;

    /** Location where shift was opened */
    readonly openLocation?: {
        readonly latitude: number;
        readonly longitude: number;
    };

    /** Notes when opening the shift */
    readonly openNotes?: string;

    /** Command ID that created this shift (for idempotency tracing) */
    readonly sourceCommandId: string;
}

// ============================================================================
// SHIFT.OPEN PAYLOAD
// ============================================================================

/**
 * Payload for shift.open command.
 * 
 * Minimal data required to open a shift.
 */
export interface ShiftOpenPayload {
    /** Optional location when opening shift */
    readonly location?: {
        readonly latitude: number;
        readonly longitude: number;
    };

    /** Optional notes when opening shift */
    readonly notes?: string;
}

/**
 * Receipt returned after shift.open command succeeds.
 */
export interface ShiftOpenReceipt {
    /** ID of the created shift */
    readonly shiftId: ShiftId;

    /** Timestamp when shift was opened */
    readonly openedAt: number;
}

// ============================================================================
// SHIFT QUERY RESULT
// ============================================================================

/**
 * Result of querying for active shift.
 */
export type ActiveShiftQuery =
    | { hasActiveShift: true; shift: ShiftRecord }
    | { hasActiveShift: false };
