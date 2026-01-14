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
