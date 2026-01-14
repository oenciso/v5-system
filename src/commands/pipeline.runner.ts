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
    isNewCommand,
    isCached,
    isInFlight
} from './idempotency';
import { IdempotencyStore, getIdempotencyStore } from './idempotency.store';
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

// Domain command handlers - shift.open
import {
    isShiftOpenCommand,
    validateShiftOpenPayload,
    checkShiftOpenPreconditions,
    executeShiftOpen,
    persistShift,
    emitShiftOpenAudit,
    ShiftOpenExecutionContext
} from '../domain/shifts';

// Domain command handlers - shift.close
import {
    isShiftCloseCommand,
    validateShiftClosePayload,
    checkShiftClosePreconditions,
    executeShiftClose,
    persistShiftClose,
    emitShiftCloseAudit,
    ShiftCloseExecutionContext
} from '../domain/shifts';

// Domain command handlers - incident.create
import {
    isIncidentCreateCommand,
    validateIncidentCreatePayload,
    checkIncidentCreatePreconditions,
    executeIncidentCreate,
    persistIncident,
    emitIncidentCreateAudit,
    IncidentCreateExecutionContext
} from '../domain/incidents';

// Domain command handlers - incident.close
import {
    isIncidentCloseCommand,
    validateIncidentClosePayload,
    checkIncidentClosePreconditions,
    executeIncidentClose,
    persistIncidentClose,
    emitIncidentCloseAudit,
    IncidentCloseExecutionContext
} from '../domain/incidents';

// Domain command handlers - rondin.start
import {
    isRondinStartCommand,
    validateRondinStartPayload,
    checkRondinStartPreconditions,
    executeRondinStart,
    persistRondin,
    emitRondinStartAudit,
    RondinStartExecutionContext
} from '../domain/rondins';

// Domain command handlers - rondin.recordCheckpoint
import {
    isRondinRecordCheckpointCommand,
    validateRondinRecordCheckpointPayload,
    checkRondinRecordCheckpointPreconditions,
    executeRondinRecordCheckpoint,
    persistRondinCheckpoint,
    emitRondinRecordCheckpointAudit,
    RondinRecordCheckpointExecutionContext
} from '../domain/rondins';

// Domain command handlers - rondin.finish
import {
    isRondinFinishCommand,
    validateRondinFinishPayload,
    checkRondinFinishPreconditions,
    executeRondinFinish,
    persistRondinFinish,
    emitRondinFinishAudit,
    RondinFinishExecutionContext
} from '../domain/rondins';

import { ShiftStore } from '../domain/shifts/store';
import { IncidentStore } from '../domain/incidents/store';
import { RondinStore } from '../domain/rondins/store';
import { AuditStore } from '../audit/store';

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

    /**
     * Idempotency store for duplicate detection.
     * Optional - defaults to FirestoreIdempotencyStore.
     */
    readonly idempotencyStore?: IdempotencyStore;

    /**
     * Shift store for shift operations.
     * Optional - defaults to FirestoreShiftStore.
     */
    readonly shiftStore?: ShiftStore;

    /**
     * Audit store for audit records.
     * Optional - defaults to FirestoreAuditStore.
     */
    readonly auditStore?: AuditStore;

    /**
     * Incident store for incident operations.
     * Optional - defaults to FirestoreIncidentStore.
     */
    readonly incidentStore?: IncidentStore;

    /**
     * Rondin store for rondin operations.
     * Optional - defaults to FirestoreRondinStore.
     */
    readonly rondinStore?: RondinStore;
}

// ============================================================================
// IDEMPOTENCY HELPERS
// ============================================================================

/**
 * Get the idempotency store from dependencies or use default.
 */
function getStore(deps: PipelineRunnerDependencies): IdempotencyStore {
    return deps.idempotencyStore ?? getIdempotencyStore();
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
 * Checks if command was already processed using Firestore.
 * Creates PENDING record for new commands.
 */
async function executeIdempotencyCheck<TPayload>(
    context: CommandExecutionContext<TPayload>,
    deps: PipelineRunnerDependencies
): Promise<CommandExecutionContext<TPayload>> {
    if (!context.command) {
        const failure = createPipelineFailure(
            'IDEMPOTENCY_CHECK',
            'INTERNAL_ERROR',
            'Idempotency check called without command'
        );
        return { ...context, currentStage: 'IDEMPOTENCY_CHECK', failure };
    }

    // Need authenticated identity to get companyId
    if (!context.identity || context.identity.kind !== 'authenticated') {
        const failure = createPipelineFailure(
            'IDEMPOTENCY_CHECK',
            'INTERNAL_ERROR',
            'Idempotency check requires authenticated identity'
        );
        return { ...context, currentStage: 'IDEMPOTENCY_CHECK', failure };
    }

    const store = getStore(deps);
    const { commandId, companyId } = context.command;

    // Check if command was already processed
    const idempotencyResult = await store.checkIdempotency(companyId, commandId);

    // Case 1: Command is in-flight (PENDING, not timed out)
    if (isInFlight(idempotencyResult)) {
        const failure = createPipelineFailure(
            'IDEMPOTENCY_CHECK',
            'DUPLICATE_COMMAND',
            'Command is currently being processed'
        );
        return {
            ...context,
            currentStage: 'IDEMPOTENCY_CHECK',
            idempotencyResult,
            failure
        };
    }

    // Case 2: Command was already processed (cached result)
    if (isCached(idempotencyResult)) {
        // Return cached result without re-processing
        const cachedRecord = idempotencyResult.record;
        const rejectionCode = cachedRecord.status === 'ACCEPTED'
            ? undefined
            : cachedRecord.resultCode;

        if (cachedRecord.status === 'REJECTED' && rejectionCode) {
            const failure = createPipelineFailure(
                'IDEMPOTENCY_CHECK',
                rejectionCode as any,
                'Command was previously rejected (cached)'
            );
            return {
                ...context,
                currentStage: 'IDEMPOTENCY_CHECK',
                idempotencyResult,
                failure
            };
        }

        // For ACCEPTED, we still need to short-circuit but not fail
        // The behavior for this will be refined when we implement full execution
        // For now, since EXECUTION is stubbed, we return the cached result as success
        // by NOT setting failure (the pipeline will continue and fail at EXECUTION stub)
    }

    // Case 3: New command - create PENDING record
    if (isNewCommand(idempotencyResult)) {
        const created = await store.createPendingRecord(companyId, commandId);

        if (!created) {
            // Race condition - another process created the record
            const failure = createPipelineFailure(
                'IDEMPOTENCY_CHECK',
                'DUPLICATE_COMMAND',
                'Command race condition detected'
            );
            return {
                ...context,
                currentStage: 'IDEMPOTENCY_CHECK',
                idempotencyResult,
                failure
            };
        }
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
 * For shift.open/close: validates payload using command-specific validator.
 * For incident.create: validates title, severity, location, evidenceRefs.
 * For other commands: no-op (assumes valid).
 */
async function executePayloadValidation<TPayload>(
    context: CommandExecutionContext<TPayload>,
    _deps: PipelineRunnerDependencies
): Promise<CommandExecutionContext<TPayload>> {
    const command = context.command;

    if (!command) {
        const failure = createPipelineFailure(
            'PAYLOAD_VALIDATION',
            'INTERNAL_ERROR',
            'Command not found in context'
        );
        return { ...context, currentStage: 'PAYLOAD_VALIDATION', failure };
    }

    // Route to command-specific validator
    if (isShiftOpenCommand(command)) {
        return validateShiftOpenPayload(
            context as unknown as ShiftOpenExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isShiftCloseCommand(command)) {
        return validateShiftClosePayload(
            context as unknown as ShiftCloseExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCreateCommand(command)) {
        return validateIncidentCreatePayload(
            context as unknown as IncidentCreateExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCloseCommand(command)) {
        return validateIncidentClosePayload(
            context as unknown as IncidentCloseExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinStartCommand(command)) {
        return validateRondinStartPayload(
            context as unknown as RondinStartExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinRecordCheckpointCommand(command)) {
        return validateRondinRecordCheckpointPayload(
            context as unknown as RondinRecordCheckpointExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinFinishCommand(command)) {
        return validateRondinFinishPayload(
            context as unknown as RondinFinishExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    // Default: no-op placeholder for unimplemented commands
    return {
        ...context,
        currentStage: 'PAYLOAD_VALIDATION',
        payloadValid: true
    };
}

/**
 * Execute PRECONDITION_CHECK stage.
 * 
 * For shift.open: checks user has no active shift.
 * For shift.close: checks user has active shift.
 * For incident.create: verifies authenticated user (no domain preconditions).
 * For other commands: no-op (assumes met).
 */
async function executePreconditionCheck<TPayload>(
    context: CommandExecutionContext<TPayload>,
    deps: PipelineRunnerDependencies
): Promise<CommandExecutionContext<TPayload>> {
    const command = context.command;

    if (!command) {
        const failure = createPipelineFailure(
            'PRECONDITION_CHECK',
            'INTERNAL_ERROR',
            'Command not found in context'
        );
        return { ...context, currentStage: 'PRECONDITION_CHECK', failure };
    }

    // Route to command-specific precondition checker
    if (isShiftOpenCommand(command)) {
        return checkShiftOpenPreconditions(
            context as unknown as ShiftOpenExecutionContext,
            { shiftStore: deps.shiftStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isShiftCloseCommand(command)) {
        return checkShiftClosePreconditions(
            context as unknown as ShiftCloseExecutionContext,
            { shiftStore: deps.shiftStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCreateCommand(command)) {
        return checkIncidentCreatePreconditions(
            context as unknown as IncidentCreateExecutionContext,
            { incidentStore: deps.incidentStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCloseCommand(command)) {
        return checkIncidentClosePreconditions(
            context as unknown as IncidentCloseExecutionContext,
            { incidentStore: deps.incidentStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinStartCommand(command)) {
        return checkRondinStartPreconditions(
            context as unknown as RondinStartExecutionContext,
            { rondinStore: deps.rondinStore, shiftStore: deps.shiftStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinRecordCheckpointCommand(command)) {
        return checkRondinRecordCheckpointPreconditions(
            context as unknown as RondinRecordCheckpointExecutionContext,
            { rondinStore: deps.rondinStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinFinishCommand(command)) {
        return checkRondinFinishPreconditions(
            context as unknown as RondinFinishExecutionContext,
            { rondinStore: deps.rondinStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    // Default: no-op placeholder for unimplemented commands
    return {
        ...context,
        currentStage: 'PRECONDITION_CHECK',
        preconditionsMet: true
    };
}

/**
 * Execute EXECUTION stage.
 * 
 * For shift.open: creates shift record.
 * For shift.close: prepares close data.
 * For incident.create: generates incident record.
 * For other commands: throws NOT_IMPLEMENTED.
 */
async function executeExecution<TPayload>(
    context: CommandExecutionContext<TPayload>,
    _deps: PipelineRunnerDependencies
): Promise<CommandExecutionContext<TPayload>> {
    const command = context.command;

    if (!command) {
        const failure = createPipelineFailure(
            'EXECUTION',
            'INTERNAL_ERROR',
            'Command not found in context'
        );
        return { ...context, currentStage: 'EXECUTION', failure };
    }

    // Route to command-specific executor
    if (isShiftOpenCommand(command)) {
        return executeShiftOpen(
            context as unknown as ShiftOpenExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isShiftCloseCommand(command)) {
        return executeShiftClose(
            context as unknown as ShiftCloseExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCreateCommand(command)) {
        return executeIncidentCreate(
            context as unknown as IncidentCreateExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCloseCommand(command)) {
        return executeIncidentClose(
            context as unknown as IncidentCloseExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinStartCommand(command)) {
        return executeRondinStart(
            context as unknown as RondinStartExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinRecordCheckpointCommand(command)) {
        return executeRondinRecordCheckpoint(
            context as unknown as RondinRecordCheckpointExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinFinishCommand(command)) {
        return executeRondinFinish(
            context as unknown as RondinFinishExecutionContext
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    // Default: throw for unimplemented commands
    throw new StageNotImplementedError('EXECUTION');
}

/**
 * Execute PERSISTENCE stage.
 * 
 * For shift.open: persists shift to Firestore.
 * For shift.close: updates shift in Firestore.
 * For incident.create: persists incident to Firestore.
 * For other commands: throws NOT_IMPLEMENTED.
 */
async function executePersistence<TPayload>(
    context: CommandExecutionContext<TPayload>,
    deps: PipelineRunnerDependencies
): Promise<CommandExecutionContext<TPayload>> {
    const command = context.command;

    if (!command) {
        const failure = createPipelineFailure(
            'PERSISTENCE',
            'INTERNAL_ERROR',
            'Command not found in context'
        );
        return { ...context, currentStage: 'PERSISTENCE', failure };
    }

    // Route to command-specific persister
    if (isShiftOpenCommand(command)) {
        return persistShift(
            context as unknown as ShiftOpenExecutionContext,
            { shiftStore: deps.shiftStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isShiftCloseCommand(command)) {
        return persistShiftClose(
            context as unknown as ShiftCloseExecutionContext,
            { shiftStore: deps.shiftStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCreateCommand(command)) {
        return persistIncident(
            context as unknown as IncidentCreateExecutionContext,
            { incidentStore: deps.incidentStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCloseCommand(command)) {
        return persistIncidentClose(
            context as unknown as IncidentCloseExecutionContext,
            { incidentStore: deps.incidentStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinStartCommand(command)) {
        return persistRondin(
            context as unknown as RondinStartExecutionContext,
            { rondinStore: deps.rondinStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinRecordCheckpointCommand(command)) {
        return persistRondinCheckpoint(
            context as unknown as RondinRecordCheckpointExecutionContext,
            { rondinStore: deps.rondinStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinFinishCommand(command)) {
        return persistRondinFinish(
            context as unknown as RondinFinishExecutionContext,
            { rondinStore: deps.rondinStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    // Default: throw for unimplemented commands
    throw new StageNotImplementedError('PERSISTENCE');
}

/**
 * Execute AUDIT_EMISSION stage.
 * 
 * For shift.open: emits audit record.
 * For shift.close: emits audit record.
 * For incident.create: emits audit record.
 * For other commands: throws NOT_IMPLEMENTED.
 */
async function executeAuditEmission<TPayload>(
    context: CommandExecutionContext<TPayload>,
    deps: PipelineRunnerDependencies
): Promise<CommandExecutionContext<TPayload>> {
    const command = context.command;

    if (!command) {
        const failure = createPipelineFailure(
            'AUDIT_EMISSION',
            'INTERNAL_ERROR',
            'Command not found in context'
        );
        return { ...context, currentStage: 'AUDIT_EMISSION', failure };
    }

    // Route to command-specific audit emitter
    if (isShiftOpenCommand(command)) {
        return emitShiftOpenAudit(
            context as unknown as ShiftOpenExecutionContext,
            { auditStore: deps.auditStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isShiftCloseCommand(command)) {
        return emitShiftCloseAudit(
            context as unknown as ShiftCloseExecutionContext,
            { auditStore: deps.auditStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCreateCommand(command)) {
        return emitIncidentCreateAudit(
            context as unknown as IncidentCreateExecutionContext,
            { auditStore: deps.auditStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isIncidentCloseCommand(command)) {
        return emitIncidentCloseAudit(
            context as unknown as IncidentCloseExecutionContext,
            { auditStore: deps.auditStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinStartCommand(command)) {
        return emitRondinStartAudit(
            context as unknown as RondinStartExecutionContext,
            { auditStore: deps.auditStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinRecordCheckpointCommand(command)) {
        return emitRondinRecordCheckpointAudit(
            context as unknown as RondinRecordCheckpointExecutionContext,
            { auditStore: deps.auditStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    if (isRondinFinishCommand(command)) {
        return emitRondinFinishAudit(
            context as unknown as RondinFinishExecutionContext,
            { auditStore: deps.auditStore }
        ) as unknown as Promise<CommandExecutionContext<TPayload>>;
    }

    // Default: throw for unimplemented commands
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
            return executeIdempotencyCheck(context, deps);

        case 'PAYLOAD_VALIDATION':
            return executePayloadValidation(context, deps);

        case 'PRECONDITION_CHECK':
            return executePreconditionCheck(context, deps);

        case 'EXECUTION':
            return executeExecution(context, deps);

        case 'PERSISTENCE':
            return executePersistence(context, deps);

        case 'AUDIT_EMISSION':
            return executeAuditEmission(context, deps);

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

    // All stages completed - success!
    // Extract receipt from context if available (command-specific)
    const contextWithReceipt = context as CommandExecutionContext<TPayload> & { receipt?: TReceipt };
    const receipt = contextWithReceipt.receipt ?? ({} as TReceipt);

    const successResult: CommandResult<TReceipt> = {
        status: 'accepted',
        commandId: command.commandId,
        serverTimestamp: Date.now(),
        receipt
    };

    // Mark idempotency as ACCEPTED
    const store = getStore(deps);
    if (context.identity && context.identity.kind === 'authenticated') {
        try {
            await store.markAccepted(command.companyId, command.commandId);
        } catch (error) {
            // Log but don't fail - command already succeeded
            console.error('Failed to mark idempotency as accepted:', error);
        }
    }

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
