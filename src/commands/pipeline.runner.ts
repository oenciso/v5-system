/**
 * @fileoverview Command Execution Pipeline Runner (Minimal Skeleton)
 * @module commands/pipeline.runner
 * 
 * FASE 3 - PASO 4: SKELETON MÍNIMO DEL PIPELINE
 * 
 * Este archivo implementa el skeleton mínimo del pipeline de ejecución.
 * Ejecuta etapas en orden, detiene en primer fallo, y retorna resultados tipados.
 * 
 * Estado de implementación:
 * - PURE stages → placeholder/no-op validators
 * - SIDE-EFFECTING stages → stubbed (NOT_IMPLEMENTED)
 * 
 * Contratos consumidos (FROZEN):
 * - SecurityKernel (src/security/kernel.ts)
 * - DomainCommand (src/commands/contracts.ts)
 * - IdempotencyCheckResult (src/commands/idempotency.ts)
 * - Pipeline contract (src/commands/pipeline.ts)
 * 
 * IMPORTANTE:
 * - NO hay ejecución de lógica de dominio
 * - NO hay escritura a Firestore
 * - NO hay emisión de auditoría
 * - Etapas SIDE-EFFECTING lanzan NOT_IMPLEMENTED
 */

import { SecurityKernel } from '../security/kernel';
import { RequestContext, AuthContext } from '../security/auth/types';
import { AccessPolicy, POLICY_ALLOW_AUTHENTICATED } from '../security/policies/contracts';
import {
    DomainCommand,
    CommandResult,
    CommandRejected,
    RejectionCode
} from './contracts';
import {
    IdempotencyCheckResult,
    IdempotencyNew,
    isNewCommand
} from './idempotency';
import {
    PipelineStage,
    PIPELINE_STAGE_ORDER,
    CommandExecutionContext,
    PipelineExecutionResult,
    PipelineSuccess,
    PipelineRejection,
    PipelineFailure,
    createPipelineFailure
} from './pipeline';

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error thrown when a stage is not implemented.
 * Used for SIDE-EFFECTING stages that are stubbed.
 */
export class StageNotImplementedError extends Error {
    readonly stage: PipelineStage;
    readonly rejectionCode: RejectionCode = 'INTERNAL_ERROR';

    constructor(stage: PipelineStage) {
        super(`Stage ${stage} is not implemented (STUB)`);
        this.name = 'StageNotImplementedError';
        this.stage = stage;
    }
}

// ============================================================================
// PIPELINE DEPENDENCIES
// ============================================================================

/**
 * Dependencies required by the pipeline runner.
 * 
 * These are injected to allow testing and flexibility.
 */
export interface PipelineRunnerDependencies {
    /** Security kernel for authentication/authorization */
    readonly securityKernel: SecurityKernel;

    /** 
     * Request context for authentication.
     * In production, this comes from the HTTP request.
     */
    readonly requestContext: RequestContext;
}

// ============================================================================
// IDEMPOTENCY CHECKER (STUB)
// ============================================================================

/**
 * Stub idempotency checker.
 * 
 * Always returns "new command" - no actual storage check.
 * In production, this would check Firestore.
 * 
 * @param _command - Command to check (unused in stub)
 * @returns IdempotencyNew indicating command should be processed
 */
function stubIdempotencyCheck(_command: DomainCommand): IdempotencyCheckResult {
    const result: IdempotencyNew = {
        behavior: 'CREATE_AND_PROCESS'
    };
    return result;
}

// ============================================================================
// STAGE EXECUTORS (PLACEHOLDERS)
// ============================================================================

/**
 * Execute INTAKE stage.
 * 
 * Normalizes the command. Currently a no-op since command is already typed.
 * Future: validate structure, normalize fields.
 */
async function executeIntake<TPayload>(
    context: CommandExecutionContext<TPayload>,
    command: DomainCommand<TPayload>
): Promise<CommandExecutionContext<TPayload>> {
    // No-op: command is already normalized/typed
    return {
        ...context,
        currentStage: 'INTAKE',
        command
    };
}

/**
 * Execute AUTHENTICATION stage.
 * 
 * Resolves identity using SecurityKernel.
 */
async function executeAuthentication<TPayload>(
    context: CommandExecutionContext<TPayload>,
    deps: PipelineRunnerDependencies
): Promise<CommandExecutionContext<TPayload>> {
    const authContext: AuthContext = await deps.securityKernel.authenticate(deps.requestContext);

    // Check for invalid identity
    if (authContext.identity.kind === 'invalid') {
        const failure = createPipelineFailure(
            'AUTHENTICATION',
            'UNAUTHORIZED',
            `Authentication failed: ${authContext.identity.reason}`
        );
        return {
            ...context,
            currentStage: 'AUTHENTICATION',
            authContext,
            identity: authContext.identity,
            failure
        };
    }

    // Check for anonymous identity
    if (authContext.identity.kind === 'anonymous') {
        const failure = createPipelineFailure(
            'AUTHENTICATION',
            'UNAUTHORIZED',
            'Anonymous access not allowed for command execution'
        );
        return {
            ...context,
            currentStage: 'AUTHENTICATION',
            authContext,
            identity: authContext.identity,
            failure
        };
    }

    return {
        ...context,
        currentStage: 'AUTHENTICATION',
        authContext,
        identity: authContext.identity
    };
}

/**
 * Execute AUTHORIZATION stage.
 * 
 * Verifies the actor has required capability using SecurityKernel.
 */
async function executeAuthorization<TPayload>(
    context: CommandExecutionContext<TPayload>,
    deps: PipelineRunnerDependencies
): Promise<CommandExecutionContext<TPayload>> {
    if (!context.authContext) {
        const failure = createPipelineFailure(
            'AUTHORIZATION',
            'INTERNAL_ERROR',
            'Authorization called without authentication context'
        );
        return { ...context, currentStage: 'AUTHORIZATION', failure };
    }

    // For now, use ALLOW_AUTHENTICATED policy
    // Future: build policy from command.module + command.capability
    const policy: AccessPolicy = POLICY_ALLOW_AUTHENTICATED;

    const authResult = await deps.securityKernel.authorize(context.authContext, policy);

    if (!authResult.allowed) {
        const failure = createPipelineFailure(
            'AUTHORIZATION',
            'FORBIDDEN',
            `Authorization denied: ${authResult.reason}`
        );
        return {
            ...context,
            currentStage: 'AUTHORIZATION',
            authorizationResult: authResult,
            failure
        };
    }

    return {
        ...context,
        currentStage: 'AUTHORIZATION',
        authorizationResult: authResult
    };
}

/**
 * Execute IDEMPOTENCY_CHECK stage.
 * 
 * Checks if command was already processed (stub - always new).
 */
async function executeIdempotencyCheck<TPayload>(
    context: CommandExecutionContext<TPayload>
): Promise<CommandExecutionContext<TPayload>> {
    if (!context.command) {
        const failure = createPipelineFailure(
            'IDEMPOTENCY_CHECK',
            'INTERNAL_ERROR',
            'Idempotency check called without command'
        );
        return { ...context, currentStage: 'IDEMPOTENCY_CHECK', failure };
    }

    const idempotencyResult = stubIdempotencyCheck(context.command);

    // If not new command, would reject here
    if (!isNewCommand(idempotencyResult)) {
        const failure = createPipelineFailure(
            'IDEMPOTENCY_CHECK',
            'DUPLICATE_COMMAND',
            'Command already processed or in-flight'
        );
        return {
            ...context,
            currentStage: 'IDEMPOTENCY_CHECK',
            idempotencyResult,
            failure
        };
    }

    return {
        ...context,
        currentStage: 'IDEMPOTENCY_CHECK',
        idempotencyResult
    };
}

/**
 * Execute PAYLOAD_VALIDATION stage.
 * 
 * Validates command payload. Currently a no-op (assumes valid).
 * Future: validate against command-specific schema.
 */
async function executePayloadValidation<TPayload>(
    context: CommandExecutionContext<TPayload>
): Promise<CommandExecutionContext<TPayload>> {
    // No-op placeholder: assume payload is valid
    // Future: validate command.payload against schema for command.commandType
    return {
        ...context,
        currentStage: 'PAYLOAD_VALIDATION',
        payloadValid: true
    };
}

/**
 * Execute PRECONDITION_CHECK stage.
 * 
 * Verifies business preconditions. Currently a no-op (assumes met).
 * Future: check domain state (e.g., shift open for incident).
 */
async function executePreconditionCheck<TPayload>(
    context: CommandExecutionContext<TPayload>
): Promise<CommandExecutionContext<TPayload>> {
    // No-op placeholder: assume preconditions met
    // Future: check business state from Firestore
    return {
        ...context,
        currentStage: 'PRECONDITION_CHECK',
        preconditionsMet: true
    };
}

/**
 * Execute EXECUTION stage (STUB).
 * 
 * Would execute domain logic. NOT IMPLEMENTED.
 */
async function executeExecution<TPayload>(
    _context: CommandExecutionContext<TPayload>
): Promise<CommandExecutionContext<TPayload>> {
    throw new StageNotImplementedError('EXECUTION');
}

/**
 * Execute PERSISTENCE stage (STUB).
 * 
 * Would persist to Firestore. NOT IMPLEMENTED.
 */
async function executePersistence<TPayload>(
    _context: CommandExecutionContext<TPayload>
): Promise<CommandExecutionContext<TPayload>> {
    throw new StageNotImplementedError('PERSISTENCE');
}

/**
 * Execute AUDIT_EMISSION stage (STUB).
 * 
 * Would emit audit event. NOT IMPLEMENTED.
 */
async function executeAuditEmission<TPayload>(
    _context: CommandExecutionContext<TPayload>
): Promise<CommandExecutionContext<TPayload>> {
    throw new StageNotImplementedError('AUDIT_EMISSION');
}

// ============================================================================
// STAGE DISPATCHER
// ============================================================================

/**
 * Dispatch a stage to its executor.
 * 
 * @param stage - Stage to execute
 * @param context - Current context
 * @param command - The command being processed
 * @param deps - Pipeline dependencies
 * @returns Updated context after stage execution
 */
async function dispatchStage<TPayload>(
    stage: PipelineStage,
    context: CommandExecutionContext<TPayload>,
    command: DomainCommand<TPayload>,
    deps: PipelineRunnerDependencies
): Promise<CommandExecutionContext<TPayload>> {
    switch (stage) {
        case 'INTAKE':
            return executeIntake(context, command);

        case 'AUTHENTICATION':
            return executeAuthentication(context, deps);

        case 'AUTHORIZATION':
            return executeAuthorization(context, deps);

        case 'IDEMPOTENCY_CHECK':
            return executeIdempotencyCheck(context);

        case 'PAYLOAD_VALIDATION':
            return executePayloadValidation(context);

        case 'PRECONDITION_CHECK':
            return executePreconditionCheck(context);

        case 'EXECUTION':
            return executeExecution(context);

        case 'PERSISTENCE':
            return executePersistence(context);

        case 'AUDIT_EMISSION':
            return executeAuditEmission(context);

        default: {
            // Exhaustiveness check
            const _exhaustive: never = stage;
            throw new Error(`Unknown stage: ${_exhaustive}`);
        }
    }
}

// ============================================================================
// REJECTION RESULT BUILDER
// ============================================================================

/**
 * Build a CommandRejected result from a PipelineFailure.
 */
function buildRejectedResult(
    commandId: string,
    failure: PipelineFailure
): CommandRejected {
    return {
        status: 'rejected',
        commandId,
        serverTimestamp: Date.now(),
        rejectionCode: failure.rejectionCode,
        message: failure.internalMessage
    };
}

// ============================================================================
// MAIN PIPELINE RUNNER
// ============================================================================

/**
 * Run the command execution pipeline.
 * 
 * Executes stages in order defined by PIPELINE_STAGE_ORDER.
 * Stops on first failure (fail-fast).
 * Returns typed PipelineExecutionResult.
 * 
 * IMPORTANT:
 * - PURE stages (1-6): Placeholder validators that pass
 * - SIDE-EFFECTING stages (7-9): Throw StageNotImplementedError
 * 
 * @param command - DomainCommand to execute
 * @param deps - Pipeline dependencies (security kernel, request context)
 * @returns PipelineExecutionResult with context
 */
export async function runCommandPipeline<TPayload, TReceipt = unknown>(
    command: DomainCommand<TPayload>,
    deps: PipelineRunnerDependencies
): Promise<PipelineExecutionResult<TPayload, TReceipt>> {
    const completedStages: PipelineStage[] = [];

    // Initialize context
    let context: CommandExecutionContext<TPayload> = {
        currentStage: 'INTAKE',
        startedAt: Date.now()
    };

    // Execute stages in order
    for (const stage of PIPELINE_STAGE_ORDER) {
        try {
            // Execute the stage
            context = await dispatchStage(stage, context, command, deps);

            // Check for failure in context
            if (context.failure) {
                // Build rejection result
                const rejection: PipelineRejection<TPayload> = {
                    outcome: 'REJECTED',
                    result: buildRejectedResult(command.commandId, context.failure),
                    context,
                    completedStages: Object.freeze([...completedStages]),
                    failedAtStage: stage
                };
                return rejection;
            }

            // Stage completed successfully
            completedStages.push(stage);

        } catch (error) {
            // Handle StageNotImplementedError (expected for SIDE-EFFECTING stages)
            if (error instanceof StageNotImplementedError) {
                const failure = createPipelineFailure(
                    error.stage,
                    'INTERNAL_ERROR',
                    `Stage ${error.stage} is not implemented`
                );

                context = { ...context, currentStage: error.stage, failure };

                const rejection: PipelineRejection<TPayload> = {
                    outcome: 'REJECTED',
                    result: buildRejectedResult(command.commandId, failure),
                    context,
                    completedStages: Object.freeze([...completedStages]),
                    failedAtStage: error.stage
                };
                return rejection;
            }

            // Unexpected error
            const failure = createPipelineFailure(
                stage,
                'INTERNAL_ERROR',
                error instanceof Error ? error.message : 'Unknown error'
            );

            context = { ...context, currentStage: stage, failure };

            const rejection: PipelineRejection<TPayload> = {
                outcome: 'REJECTED',
                result: buildRejectedResult(command.commandId, failure),
                context,
                completedStages: Object.freeze([...completedStages]),
                failedAtStage: stage
            };
            return rejection;
        }
    }

    // All stages completed (should not happen with current stubs)
    // This would be success in a full implementation
    const successResult: CommandResult<TReceipt> = {
        status: 'accepted',
        commandId: command.commandId,
        serverTimestamp: Date.now(),
        receipt: {} as TReceipt // Placeholder
    };

    const success: PipelineSuccess<TPayload, TReceipt> = {
        outcome: 'SUCCESS',
        result: successResult,
        context,
        completedStages: Object.freeze([...completedStages])
    };

    return success;
}

// ============================================================================
// PIPELINE RUNNER UP TO STAGE (FOR TESTING PURE STAGES)
// ============================================================================

/**
 * Run the pipeline up to (and including) a specific stage.
 * 
 * Useful for testing individual stages without hitting SIDE-EFFECTING stubs.
 * 
 * @param command - DomainCommand to execute
 * @param deps - Pipeline dependencies
 * @param stopAfterStage - Last stage to execute
 * @returns PipelineExecutionResult with partial context
 */
export async function runPipelineUpToStage<TPayload>(
    command: DomainCommand<TPayload>,
    deps: PipelineRunnerDependencies,
    stopAfterStage: PipelineStage
): Promise<PipelineExecutionResult<TPayload, unknown>> {
    const completedStages: PipelineStage[] = [];

    // Initialize context
    let context: CommandExecutionContext<TPayload> = {
        currentStage: 'INTAKE',
        startedAt: Date.now()
    };

    // Execute stages in order until stopAfterStage
    for (const stage of PIPELINE_STAGE_ORDER) {
        try {
            // Execute the stage
            context = await dispatchStage(stage, context, command, deps);

            // Check for failure in context
            if (context.failure) {
                const rejection: PipelineRejection<TPayload> = {
                    outcome: 'REJECTED',
                    result: buildRejectedResult(command.commandId, context.failure),
                    context,
                    completedStages: Object.freeze([...completedStages]),
                    failedAtStage: stage
                };
                return rejection;
            }

            // Stage completed successfully
            completedStages.push(stage);

            // Stop if we've reached the target stage
            if (stage === stopAfterStage) {
                break;
            }

        } catch (error) {
            if (error instanceof StageNotImplementedError) {
                const failure = createPipelineFailure(
                    error.stage,
                    'INTERNAL_ERROR',
                    `Stage ${error.stage} is not implemented`
                );

                context = { ...context, currentStage: error.stage, failure };

                const rejection: PipelineRejection<TPayload> = {
                    outcome: 'REJECTED',
                    result: buildRejectedResult(command.commandId, failure),
                    context,
                    completedStages: Object.freeze([...completedStages]),
                    failedAtStage: error.stage
                };
                return rejection;
            }

            const failure = createPipelineFailure(
                stage,
                'INTERNAL_ERROR',
                error instanceof Error ? error.message : 'Unknown error'
            );

            context = { ...context, currentStage: stage, failure };

            const rejection: PipelineRejection<TPayload> = {
                outcome: 'REJECTED',
                result: buildRejectedResult(command.commandId, failure),
                context,
                completedStages: Object.freeze([...completedStages]),
                failedAtStage: stage
            };
            return rejection;
        }
    }

    // Partial success (stopped before full completion)
    const successResult: CommandResult<unknown> = {
        status: 'accepted',
        commandId: command.commandId,
        serverTimestamp: Date.now(),
        receipt: { partialRun: true, stoppedAt: stopAfterStage }
    };

    const success: PipelineSuccess<TPayload, unknown> = {
        outcome: 'SUCCESS',
        result: successResult,
        context,
        completedStages: Object.freeze([...completedStages])
    };

    return success;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get the last PURE stage in the pipeline.
 * 
 * Useful for testing all PURE stages without hitting stubs.
 */
export function getLastPureStage(): PipelineStage {
    return 'PRECONDITION_CHECK';
}

/**
 * Check if all PURE stages completed successfully.
 */
export function didPureStagesComplete(completedStages: readonly PipelineStage[]): boolean {
    const pureStages: PipelineStage[] = [
        'INTAKE',
        'AUTHENTICATION',
        'AUTHORIZATION',
        'IDEMPOTENCY_CHECK',
        'PAYLOAD_VALIDATION',
        'PRECONDITION_CHECK'
    ];

    return pureStages.every(stage => completedStages.includes(stage));
}
