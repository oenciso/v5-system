/**
 * @fileoverview Rondins Domain Module Public API
 * @module domain/rondins
 * 
 * FASE 3 - PASO 10
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
    ActiveRondinQuery
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
