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

// Pipeline types
export type {
    PipelineStage,
    StageEffectType,
    PipelineStageMetadata,
    CommandExecutionContext,
    PipelineFailure,
    PipelineExecutionResult,
    PipelineSuccess,
    PipelineRejection,
    CommandExecutionPipeline,
    PipelineStageHandler,
    StageRejectionMapping
} from './pipeline';

// Pipeline constants and helpers
export {
    PIPELINE_STAGE_ORDER,
    PIPELINE_STAGE_METADATA,
    STAGE_TO_REJECTION_CODES,
    isPureStage,
    isSideEffectingStage,
    isStageImplemented,
    getPureStages,
    getSideEffectingStages,
    isPipelineSuccess,
    isPipelineRejection,
    createInitialContext,
    createPipelineFailure
} from './pipeline';

// Pipeline runner (PASO 4)
export type {
    PipelineRunnerDependencies
} from './pipeline.runner';

export {
    StageNotImplementedError,
    runCommandPipeline,
    runPipelineUpToStage,
    getLastPureStage,
    didPureStagesComplete
} from './pipeline.runner';
