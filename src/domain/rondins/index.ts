/**
 * @fileoverview Rondins Domain Module Public API
 * @module domain/rondins
 * 
 * FASE 3 - PASO 10 & 11
 */

// Types
export type {
    RondinId,
    RouteId,
    RondinStatus,
    GeoLocation,
    RondinRecord,
    RondinStartPayload,
    RondinStartReceipt,
    ActiveRondinQuery,
    CheckpointId,
    RondinCheckpointRecord,
    RondinRecordCheckpointPayload,
    RondinRecordCheckpointReceipt
} from './types';

// Store
export type {
    RondinStore
} from './store';

export {
    RONDINS_COLLECTION,
    COMPANIES_COLLECTION,
    FirestoreRondinStore,
    createRondinStore,
    getRondinStore,
    resetRondinStore
} from './store';

// Commands - rondin.start
export {
    isRondinStartCommand,
    validateRondinStartPayload,
    checkRondinStartPreconditions,
    executeRondinStart,
    persistRondin,
    emitRondinStartAudit
} from './commands/start';

export type {
    RondinStartExecutionContext,
    RondinStartDependencies
} from './commands/start';

// Commands - rondin.recordCheckpoint
export {
    isRondinRecordCheckpointCommand,
    validateRondinRecordCheckpointPayload,
    checkRondinRecordCheckpointPreconditions,
    executeRondinRecordCheckpoint,
    persistRondinCheckpoint,
    emitRondinRecordCheckpointAudit
} from './commands/recordCheckpoint';

export type {
    RondinRecordCheckpointExecutionContext,
    RondinRecordCheckpointDependencies
} from './commands/recordCheckpoint';

