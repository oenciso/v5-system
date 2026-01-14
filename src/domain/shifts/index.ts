/**
 * @fileoverview Shifts Domain Module Public API
 * @module domain/shifts
 * 
 * FASE 3 - PASO 6 & 7
 */

// Types
export type {
    ShiftId,
    ShiftStatus,
    ShiftRecord,
    ShiftOpenPayload,
    ShiftOpenReceipt,
    ShiftClosePayload,
    ShiftCloseReceipt,
    ActiveShiftQuery
} from './types';

// Store
export type {
    ShiftStore
} from './store';

export {
    SHIFTS_COLLECTION,
    COMPANIES_COLLECTION,
    FirestoreShiftStore,
    createShiftStore,
    getShiftStore,
    resetShiftStore
} from './store';

// Commands - shift.open
export {
    isShiftOpenCommand,
    validateShiftOpenPayload,
    checkShiftOpenPreconditions,
    executeShiftOpen,
    persistShift,
    emitShiftOpenAudit
} from './commands/open';

export type {
    ShiftOpenExecutionContext,
    ShiftOpenDependencies
} from './commands/open';

// Commands - shift.close
export {
    isShiftCloseCommand,
    validateShiftClosePayload,
    checkShiftClosePreconditions,
    executeShiftClose,
    persistShiftClose,
    emitShiftCloseAudit
} from './commands/close';

export type {
    ShiftCloseExecutionContext,
    ShiftCloseDependencies
} from './commands/close';

