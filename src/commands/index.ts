/**
 * @fileoverview Commands Module Public API
 * @module commands
 * 
 * FASE 3 - PASO 1
 * Exportaciones públicas del módulo de comandos.
 */

// Tipos base
export type {
    CommandId,
    CommandOrigin,
    CommandVersion,
    CommandType
} from './contracts';

// Contrato de comando
export type {
    CommandActor,
    DomainCommand
} from './contracts';

// Resultado de comando
export type {
    CommandResult,
    CommandAccepted,
    CommandRejected,
    RejectionCode
} from './contracts';

// Constantes y helpers
export {
    CANONICAL_COMMAND_TYPES,
    isValidCommandType,
    isAccepted,
    isRejected
} from './contracts';

// Idempotency types
export type {
    IdempotencyKey,
    IdempotencyStatus,
    IdempotencyRecord,
    IdempotencyResultCode,
    DuplicateBehavior,
    IdempotencyCheckResult,
    IdempotencyNew,
    IdempotencyInFlight,
    IdempotencyCached
} from './idempotency';

// Idempotency constants and helpers
export {
    IDEMPOTENCY_TTL_MS,
    PENDING_TIMEOUT_MS,
    isNewCommand,
    isInFlight,
    isCached,
    createIdempotencyKey
} from './idempotency';
