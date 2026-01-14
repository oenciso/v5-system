/**
 * @fileoverview Command Execution Pipeline Contract
 * @module commands/pipeline
 * 
 * FASE 3 - PASO 3: PIPELINE DE EJECUCIÓN DE COMANDOS (DEFINICIÓN SOLO)
 * 
 * Este archivo define el CONTRATO canónico del pipeline de ejecución de comandos.
 * Define las etapas, contexto, y garantías del pipeline sin implementar runtime.
 * 
 * Fuentes canónicas:
 * - SISTEMA_CANONICO_v1.9.md §9 (Comandos de dominio)
 * - INVARIANTES_DE_PRODUCCION.md (Cliente hostil, idempotencia obligatoria)
 * 
 * Contratos consumidos (FROZEN, NO MODIFICAR):
 * - SecurityKernel (src/security/kernel.ts)
 * - DomainCommand (src/commands/contracts.ts)
 * - IdempotencyRecord (src/commands/idempotency.ts)
 * 
 * IMPORTANTE:
 * - Este archivo define SOLO el contrato del pipeline
 * - NO hay ejecución de comandos
 * - NO hay persistencia (Firestore)
 * - NO hay emisión de auditoría
 * - NO hay handlers implementados
 */

import { AuthContext, RuntimeIdentity } from '../security/auth/types';
import { AuthorizationResult } from '../security/policies/contracts';
import {
    DomainCommand,
    CommandResult,
    RejectionCode
} from './contracts';
import { IdempotencyCheckResult } from './idempotency';

// ============================================================================
// PIPELINE STAGES (ORDERED)
// ============================================================================

/**
 * Etapas ordenadas del pipeline de ejecución.
 * 
 * El pipeline ejecuta las etapas en orden estricto.
 * Si una etapa falla, el pipeline se detiene inmediatamente.
 * 
 * Clasificación de efectos secundarios:
 * - PURE: No modifica estado, solo valida/transforma
 * - SIDE-EFFECTING: Modifica estado (pero NO implementado)
 * 
 * @invariant Cada etapa debe completar antes de la siguiente
 * @invariant Un fallo en cualquier etapa termina el pipeline
 */
export type PipelineStage =
    | 'INTAKE'              // 1. PURE: Normalización del comando
    | 'AUTHENTICATION'      // 2. PURE: Resolución de identidad
    | 'AUTHORIZATION'       // 3. PURE: Verificación de capacidad
    | 'IDEMPOTENCY_CHECK'   // 4. PURE: Verificación de duplicados
    | 'PAYLOAD_VALIDATION'  // 5. PURE: Validación de payload
    | 'PRECONDITION_CHECK'  // 6. PURE: Verificación de precondiciones de negocio
    | 'EXECUTION'           // 7. SIDE-EFFECTING (ABSTRACT): Ejecución de lógica de dominio
    | 'PERSISTENCE'         // 8. SIDE-EFFECTING (ABSTRACT): Persistencia en Firestore
    | 'AUDIT_EMISSION';     // 9. SIDE-EFFECTING (ABSTRACT): Emisión de evento de auditoría

/**
 * Orden canónico de etapas del pipeline.
 * 
 * El orden es INMUTABLE y está justificado:
 * 
 * 1. INTAKE: Normaliza antes de cualquier validación
 * 2. AUTHENTICATION: Identifica al actor antes de autorizar
 * 3. AUTHORIZATION: Verifica permisos antes de cualquier lógica
 * 4. IDEMPOTENCY_CHECK: Detecta duplicados antes de procesar
 * 5. PAYLOAD_VALIDATION: Valida datos antes de lógica de negocio
 * 6. PRECONDITION_CHECK: Verifica estado de negocio antes de ejecutar
 * 7. EXECUTION: Ejecuta la lógica de dominio (ABSTRACT)
 * 8. PERSISTENCE: Persiste el resultado (ABSTRACT)
 * 9. AUDIT_EMISSION: Registra para auditoría (ABSTRACT)
 */
export const PIPELINE_STAGE_ORDER: readonly PipelineStage[] = Object.freeze([
    'INTAKE',
    'AUTHENTICATION',
    'AUTHORIZATION',
    'IDEMPOTENCY_CHECK',
    'PAYLOAD_VALIDATION',
    'PRECONDITION_CHECK',
    'EXECUTION',
    'PERSISTENCE',
    'AUDIT_EMISSION'
]);

// ============================================================================
// STAGE EFFECT CLASSIFICATION
// ============================================================================

/**
 * Clasificación de efectos secundarios por etapa.
 * 
 * PURE: La etapa NO modifica estado externo.
 *       Solo lee, valida, o transforma datos.
 *       Puede ser reintentada sin consecuencias.
 * 
 * SIDE_EFFECTING: La etapa MODIFICA estado externo.
 *                 Requiere idempotencia o compensación.
 *                 Marcadas como ABSTRACT (no implementadas).
 */
export type StageEffectType = 'PURE' | 'SIDE_EFFECTING';

/**
 * Metadatos de cada etapa del pipeline.
 */
export interface PipelineStageMetadata {
    /** Nombre de la etapa */
    readonly stage: PipelineStage;
    /** Clasificación de efectos */
    readonly effect: StageEffectType;
    /** Descripción breve */
    readonly description: string;
    /** Si está implementada (false = ABSTRACT) */
    readonly implemented: boolean;
    /** Códigos de rechazo posibles en esta etapa */
    readonly possibleRejections: readonly RejectionCode[];
}

/**
 * Metadatos declarativos de todas las etapas.
 * 
 * Esto documenta el comportamiento esperado de cada etapa
 * sin implementar la lógica.
 */
export const PIPELINE_STAGE_METADATA: Readonly<Record<PipelineStage, PipelineStageMetadata>> = Object.freeze({
    INTAKE: {
        stage: 'INTAKE',
        effect: 'PURE',
        description: 'Normaliza el comando crudo. Valida estructura básica.',
        implemented: false,
        possibleRejections: ['INVALID_PAYLOAD', 'VERSION_MISMATCH']
    },
    AUTHENTICATION: {
        stage: 'AUTHENTICATION',
        effect: 'PURE',
        description: 'Resuelve identidad del actor. Consume SecurityKernel.authenticate().',
        implemented: false,
        possibleRejections: ['UNAUTHORIZED', 'COMPANY_SUSPENDED', 'USER_SUSPENDED']
    },
    AUTHORIZATION: {
        stage: 'AUTHORIZATION',
        effect: 'PURE',
        description: 'Verifica que el actor tiene la capacidad requerida. Consume SecurityKernel.authorize().',
        implemented: false,
        possibleRejections: ['FORBIDDEN', 'MODULE_DISABLED']
    },
    IDEMPOTENCY_CHECK: {
        stage: 'IDEMPOTENCY_CHECK',
        effect: 'PURE',
        description: 'Verifica si el comando ya fue procesado. Consume IdempotencyRecord.',
        implemented: false,
        possibleRejections: ['DUPLICATE_COMMAND']
    },
    PAYLOAD_VALIDATION: {
        stage: 'PAYLOAD_VALIDATION',
        effect: 'PURE',
        description: 'Valida el payload específico del tipo de comando.',
        implemented: false,
        possibleRejections: ['INVALID_PAYLOAD']
    },
    PRECONDITION_CHECK: {
        stage: 'PRECONDITION_CHECK',
        effect: 'PURE',
        description: 'Verifica precondiciones de negocio (e.g., turno abierto para registrar incidente).',
        implemented: false,
        possibleRejections: ['INVALID_STATE', 'PRECONDITION_FAILED', 'RESOURCE_NOT_FOUND', 'RESOURCE_LOCKED']
    },
    EXECUTION: {
        stage: 'EXECUTION',
        effect: 'SIDE_EFFECTING',
        description: 'Ejecuta la lógica de dominio. ABSTRACT - NO IMPLEMENTADO.',
        implemented: false,
        possibleRejections: ['INTERNAL_ERROR']
    },
    PERSISTENCE: {
        stage: 'PERSISTENCE',
        effect: 'SIDE_EFFECTING',
        description: 'Persiste el resultado en Firestore. ABSTRACT - NO IMPLEMENTADO.',
        implemented: false,
        possibleRejections: ['INTERNAL_ERROR']
    },
    AUDIT_EMISSION: {
        stage: 'AUDIT_EMISSION',
        effect: 'SIDE_EFFECTING',
        description: 'Emite evento de auditoría. ABSTRACT - NO IMPLEMENTADO.',
        implemented: false,
        possibleRejections: ['INTERNAL_ERROR']
    }
});

// ============================================================================
// EXECUTION CONTEXT
// ============================================================================

/**
 * Contexto de ejecución del comando.
 * 
 * Acumulador inmutable que se enriquece a medida que el pipeline avanza.
 * Cada etapa consume el contexto anterior y produce uno enriquecido.
 * 
 * @invariant Cada campo es readonly e inmutable
 * @invariant Campos se agregan progresivamente, nunca se remueven
 */
export interface CommandExecutionContext<TPayload = unknown> {
    // ========================================================================
    // METADATA DEL PIPELINE
    // ========================================================================

    /** Etapa actual del pipeline */
    readonly currentStage: PipelineStage;

    /** Timestamp de inicio del pipeline (Unix ms) */
    readonly startedAt: number;

    // ========================================================================
    // COMANDO (disponible desde INTAKE)
    // ========================================================================

    /** 
     * Comando normalizado.
     * Disponible después de INTAKE.
     */
    readonly command?: DomainCommand<TPayload>;

    // ========================================================================
    // IDENTIDAD (disponible desde AUTHENTICATION)
    // ========================================================================

    /**
     * Contexto de autenticación resuelto.
     * Disponible después de AUTHENTICATION.
     * Derivado de SecurityKernel.authenticate().
     */
    readonly authContext?: AuthContext;

    /**
     * Identidad resuelta (shortcut a authContext.identity).
     * Permite acceso directo para etapas posteriores.
     */
    readonly identity?: RuntimeIdentity;

    // ========================================================================
    // AUTORIZACIÓN (disponible desde AUTHORIZATION)
    // ========================================================================

    /**
     * Resultado de autorización.
     * Disponible después de AUTHORIZATION.
     * Derivado de SecurityKernel.authorize().
     */
    readonly authorizationResult?: AuthorizationResult;

    // ========================================================================
    // IDEMPOTENCIA (disponible desde IDEMPOTENCY_CHECK)
    // ========================================================================

    /**
     * Resultado de verificación de idempotencia.
     * Disponible después de IDEMPOTENCY_CHECK.
     */
    readonly idempotencyResult?: IdempotencyCheckResult;

    // ========================================================================
    // VALIDACIÓN (disponible desde PAYLOAD_VALIDATION)
    // ========================================================================

    /**
     * Indica si el payload fue validado exitosamente.
     * Disponible después de PAYLOAD_VALIDATION.
     */
    readonly payloadValid?: boolean;

    // ========================================================================
    // PRECONDICIONES (disponible desde PRECONDITION_CHECK)
    // ========================================================================

    /**
     * Indica si las precondiciones de negocio fueron verificadas.
     * Disponible después de PRECONDITION_CHECK.
     */
    readonly preconditionsMet?: boolean;

    // ========================================================================
    // SEGUIMIENTO DE ERRORES
    // ========================================================================

    /**
     * Si el pipeline falló, contiene la información del fallo.
     */
    readonly failure?: PipelineFailure;
}

/**
 * Información de fallo del pipeline.
 * 
 * Captura dónde y por qué falló el pipeline.
 */
export interface PipelineFailure {
    /** Etapa donde ocurrió el fallo */
    readonly failedAt: PipelineStage;
    /** Código de rechazo */
    readonly rejectionCode: RejectionCode;
    /** Mensaje descriptivo (solo para logs, no exponer al cliente) */
    readonly internalMessage: string;
    /** Timestamp del fallo */
    readonly failedAtTimestamp: number;
}

// ============================================================================
// PIPELINE RESULT
// ============================================================================

/**
 * Resultado del pipeline de ejecución.
 * 
 * Extiende CommandResult con información de contexto del pipeline.
 * 
 * @invariant Siempre contiene el contexto final del pipeline
 * @invariant El resultado es coherente con el estado del contexto
 */
export type PipelineExecutionResult<TPayload = unknown, TReceipt = unknown> =
    | PipelineSuccess<TPayload, TReceipt>
    | PipelineRejection<TPayload>;

/**
 * Pipeline completado exitosamente.
 * El comando fue aceptado y procesado.
 */
export interface PipelineSuccess<TPayload = unknown, TReceipt = unknown> {
    readonly outcome: 'SUCCESS';
    /** El resultado del comando (accepted) */
    readonly result: CommandResult<TReceipt>;
    /** Contexto final del pipeline */
    readonly context: CommandExecutionContext<TPayload>;
    /** Etapas completadas en orden */
    readonly completedStages: readonly PipelineStage[];
}

/**
 * Pipeline terminado con rechazo.
 * El comando fue rechazado en alguna etapa.
 */
export interface PipelineRejection<TPayload = unknown> {
    readonly outcome: 'REJECTED';
    /** El resultado del comando (rejected) */
    readonly result: CommandResult<never>;
    /** Contexto al momento del fallo */
    readonly context: CommandExecutionContext<TPayload>;
    /** Etapas completadas antes del fallo */
    readonly completedStages: readonly PipelineStage[];
    /** Etapa donde falló */
    readonly failedAtStage: PipelineStage;
}

// ============================================================================
// PIPELINE CONTRACT (ABSTRACT)
// ============================================================================

/**
 * Contrato del pipeline de ejecución de comandos.
 * 
 * SISTEMA_CANONICO_v1.9.md §9.1:
 * > "Todo cambio de estado ocurre por un comando."
 * > "El backend decide el resultado final."
 * 
 * Garantías del pipeline:
 * 
 * 1. ORDEN: Las etapas se ejecutan en orden estricto definido.
 * 2. FAIL-FAST: Si una etapa falla, el pipeline se detiene.
 * 3. TRAZABILIDAD: El contexto acumula información de cada etapa.
 * 4. DETERMINISMO: Mismo comando + estado → mismo resultado.
 * 5. IDEMPOTENCIA: Comandos duplicados devuelven resultado cacheado.
 * 
 * @abstract Esta interfaz NO tiene implementación.
 *           Define el contrato para implementación futura.
 */
export interface CommandExecutionPipeline {
    /**
     * Ejecuta un comando a través del pipeline completo.
     * 
     * @param rawCommand - Comando en formato crudo (antes de normalización)
     * @returns Resultado del pipeline con contexto completo
     * 
     * @abstract NO IMPLEMENTADO - Solo contrato
     */
    execute<TPayload, TReceipt>(
        rawCommand: unknown
    ): Promise<PipelineExecutionResult<TPayload, TReceipt>>;

    /**
     * Ejecuta una etapa específica del pipeline.
     * 
     * Usado internamente para composición de etapas.
     * Cada etapa recibe el contexto anterior y produce uno nuevo.
     * 
     * @param stage - Etapa a ejecutar
     * @param context - Contexto actual del pipeline
     * @returns Contexto enriquecido o con fallo
     * 
     * @abstract NO IMPLEMENTADO - Solo contrato
     */
    executeStage<TPayload>(
        stage: PipelineStage,
        context: CommandExecutionContext<TPayload>
    ): Promise<CommandExecutionContext<TPayload>>;
}

// ============================================================================
// STAGE HANDLERS (ABSTRACT)
// ============================================================================

/**
 * Handler genérico para una etapa del pipeline.
 * 
 * Cada etapa tiene un handler que:
 * 1. Recibe el contexto actual
 * 2. Ejecuta la lógica de la etapa
 * 3. Retorna el contexto enriquecido o con fallo
 * 
 * @abstract NO IMPLEMENTADO - Solo contrato
 */
export interface PipelineStageHandler<TPayload = unknown> {
    /**
     * Nombre de la etapa que maneja.
     */
    readonly stage: PipelineStage;

    /**
     * Ejecuta la lógica de la etapa.
     * 
     * @param context - Contexto actual del pipeline
     * @returns Contexto enriquecido (éxito) o con failure (fallo)
     * 
     * @abstract NO IMPLEMENTADO - Solo contrato
     */
    handle(
        context: CommandExecutionContext<TPayload>
    ): Promise<CommandExecutionContext<TPayload>>;
}

// ============================================================================
// FAILURE POINT MAPPINGS
// ============================================================================

/**
 * Mapeo de etapas a códigos de rechazo esperados.
 * 
 * Este mapeo documenta qué rechazos son válidos en cada etapa.
 * Ayuda a diagnosticar problemas y validar implementaciones futuras.
 */
export type StageRejectionMapping = {
    readonly [K in PipelineStage]: readonly RejectionCode[];
};

/**
 * Mapeo canónico de etapas a rechazos.
 * 
 * Derivado de PIPELINE_STAGE_METADATA para conveniencia.
 */
export const STAGE_TO_REJECTION_CODES: StageRejectionMapping = Object.freeze({
    INTAKE: ['INVALID_PAYLOAD', 'VERSION_MISMATCH'],
    AUTHENTICATION: ['UNAUTHORIZED', 'COMPANY_SUSPENDED', 'USER_SUSPENDED'],
    AUTHORIZATION: ['FORBIDDEN', 'MODULE_DISABLED'],
    IDEMPOTENCY_CHECK: ['DUPLICATE_COMMAND'],
    PAYLOAD_VALIDATION: ['INVALID_PAYLOAD'],
    PRECONDITION_CHECK: ['INVALID_STATE', 'PRECONDITION_FAILED', 'RESOURCE_NOT_FOUND', 'RESOURCE_LOCKED'],
    EXECUTION: ['INTERNAL_ERROR'],
    PERSISTENCE: ['INTERNAL_ERROR'],
    AUDIT_EMISSION: ['INTERNAL_ERROR']
} as const);

// ============================================================================
// TYPE GUARDS AND HELPERS
// ============================================================================

/**
 * Verifica si una etapa es PURE (sin efectos secundarios).
 */
export function isPureStage(stage: PipelineStage): boolean {
    return PIPELINE_STAGE_METADATA[stage].effect === 'PURE';
}

/**
 * Verifica si una etapa tiene efectos secundarios.
 */
export function isSideEffectingStage(stage: PipelineStage): boolean {
    return PIPELINE_STAGE_METADATA[stage].effect === 'SIDE_EFFECTING';
}

/**
 * Verifica si una etapa está implementada.
 * 
 * NOTA: Actualmente NINGUNA etapa está implementada.
 *       Este helper es para uso futuro.
 */
export function isStageImplemented(stage: PipelineStage): boolean {
    return PIPELINE_STAGE_METADATA[stage].implemented;
}

/**
 * Obtiene las etapas PURE del pipeline.
 */
export function getPureStages(): readonly PipelineStage[] {
    return PIPELINE_STAGE_ORDER.filter(isPureStage);
}

/**
 * Obtiene las etapas con efectos secundarios del pipeline.
 */
export function getSideEffectingStages(): readonly PipelineStage[] {
    return PIPELINE_STAGE_ORDER.filter(isSideEffectingStage);
}

/**
 * Verifica si el resultado del pipeline es exitoso.
 */
export function isPipelineSuccess<TPayload, TReceipt>(
    result: PipelineExecutionResult<TPayload, TReceipt>
): result is PipelineSuccess<TPayload, TReceipt> {
    return result.outcome === 'SUCCESS';
}

/**
 * Verifica si el resultado del pipeline es un rechazo.
 */
export function isPipelineRejection<TPayload>(
    result: PipelineExecutionResult<TPayload, unknown>
): result is PipelineRejection<TPayload> {
    return result.outcome === 'REJECTED';
}

/**
 * Crea un contexto inicial para el pipeline.
 * 
 * @param stage - Etapa inicial (normalmente 'INTAKE')
 * @returns Contexto vacío listo para enriquecerse
 */
export function createInitialContext<TPayload>(
    stage: PipelineStage = 'INTAKE'
): CommandExecutionContext<TPayload> {
    return Object.freeze({
        currentStage: stage,
        startedAt: Date.now()
    });
}

/**
 * Crea un fallo del pipeline.
 * 
 * @param stage - Etapa donde ocurrió el fallo
 * @param rejectionCode - Código de rechazo
 * @param message - Mensaje interno (no exponer al cliente)
 * @returns Objeto de fallo inmutable
 */
export function createPipelineFailure(
    stage: PipelineStage,
    rejectionCode: RejectionCode,
    message: string
): PipelineFailure {
    return Object.freeze({
        failedAt: stage,
        rejectionCode,
        internalMessage: message,
        failedAtTimestamp: Date.now()
    });
}
