/**
 * @fileoverview Domain Command Contract
 * @module commands/contracts
 * 
 * FASE 3 - PASO 1: CONTRATO DE COMANDO DE DOMINIO
 * 
 * Este archivo define el CONTRATO canónico para comandos de dominio.
 * Toda acción que modifique estado debe pasar por este contrato.
 * 
 * Fuente: SISTEMA_CANONICO_v1.9.md - Comandos de dominio
 * 
 * Principios canónicos (§9.1):
 * - Todo cambio de estado ocurre por un comando
 * - Los comandos son intenciones, no resultados
 * - Los comandos son: inmutables, idempotentes, auditables
 * - El backend decide el resultado final
 * 
 * Estructura canónica (§9.2):
 * - commandId (único, idempotencia)
 * - commandType
 * - companyId
 * - actorId
 * - origin (android | web)
 * - module
 * - capability
 * - payload (mínimo necesario)
 * - clientTimestamp
 * - version
 * 
 * IMPORTANTE:
 * - Este archivo define SOLO el contrato
 * - NO hay ejecución de comandos
 * - NO hay persistencia
 * - NO hay lógica de negocio
 * 
 * Regla de cierre (§9):
 * > "Si una acción no es un comando,
 * > no puede cambiar el estado del sistema."
 */

import { UserId, CompanyId, UserRole } from '../security/auth/types';
import { SystemModule, Capability } from '../security/modules/definitions';

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Identificador único de comando.
 * Usado para idempotencia y trazabilidad.
 */
export type CommandId = string;

/**
 * Origen del comando.
 * Indica desde qué plataforma se generó.
 */
export type CommandOrigin = 'android' | 'web';

/**
 * Versión del comando.
 * Usado para evolución de contratos.
 */
export type CommandVersion = number;

// ============================================================================
// TIPOS DE COMANDO
// ============================================================================

/**
 * Tipos de comando canónicos (§9.5)
 * 
 * Cada tipo corresponde a una capacidad operativa.
 */
export type CommandType =
    // Turnos
    | 'shift.open'
    | 'shift.close'
    | 'shift.close.supervised'
    // Incidentes
    | 'incident.create'
    | 'incident.close'
    // Rondines
    | 'rondin.start'
    | 'rondin.recordCheckpoint'
    | 'rondin.finish'
    // Checklists
    | 'checklist.submit'
    // Control de accesos
    | 'access.registerEntry'
    | 'access.registerExit'
    // Control vehicular
    | 'vehicle.registerEntry'
    | 'vehicle.registerExit'
    // Evidencias
    | 'evidence.attach'
    // Puntos de control / QR
    | 'checkpoint.create'
    | 'checkpoint.disable';

// ============================================================================
// ACTOR (DERIVADO DE IDENTITY)
// ============================================================================

/**
 * Actor del comando.
 * Derivado de AuthenticatedIdentity, pero inmutable en el comando.
 * 
 * El actor NO puede modificarse después de crear el comando.
 */
export interface CommandActor {
    /** ID del usuario que ejecuta el comando */
    readonly uid: UserId;
    /** Rol del usuario al momento de crear el comando */
    readonly role: UserRole;
}

// ============================================================================
// CONTRATO DE COMANDO
// ============================================================================

/**
 * DomainCommand - Contrato canónico de comando de dominio.
 * 
 * SISTEMA_CANONICO_v1.9.md §9.2
 * 
 * Garantías:
 * - INMUTABLE: Una vez creado, no se modifica
 * - IDEMPOTENTE: Mismo commandId = mismo resultado
 * - AUDITABLE: Toda información necesaria para trazar
 * - TRAZABLE: Actor, empresa, módulo, capacidad explícitos
 * 
 * @invariant commandId es único globalmente
 * @invariant companyId vincula al tenant
 * @invariant module + capability definen el contexto de ejecución
 * @invariant version permite evolución sin romper contratos
 */
export interface DomainCommand<TPayload = unknown> {
    // ========================================================================
    // IDENTIFICACIÓN (inmutable, generada por cliente)
    // ========================================================================

    /**
     * Identificador único del comando.
     * Generado por el cliente antes de enviar.
     * Usado para idempotencia obligatoria.
     */
    readonly commandId: CommandId;

    /**
     * Tipo de comando.
     * Define qué acción se solicita.
     */
    readonly commandType: CommandType;

    /**
     * Versión del contrato del comando.
     * Permite evolución sin romper clientes existentes.
     */
    readonly version: CommandVersion;

    // ========================================================================
    // CONTEXTO DE SEGURIDAD (derivado de identidad)
    // ========================================================================

    /**
     * Actor que ejecuta el comando.
     * Derivado de la identidad autenticada.
     */
    readonly actor: CommandActor;

    /**
     * Empresa a la que pertenece el comando.
     * Define el tenant para aislamiento.
     */
    readonly companyId: CompanyId;

    // ========================================================================
    // CONTEXTO DE EJECUCIÓN
    // ========================================================================

    /**
     * Módulo al que pertenece el comando.
     */
    readonly module: SystemModule;

    /**
     * Capacidad requerida para ejecutar el comando.
     */
    readonly capability: Capability;

    /**
     * Origen del comando.
     * Indica la plataforma desde donde se generó.
     */
    readonly origin: CommandOrigin;

    // ========================================================================
    // TIMESTAMPS
    // ========================================================================

    /**
     * Timestamp del cliente al momento de crear el comando.
     * Puede diferir del timestamp del servidor.
     */
    readonly clientTimestamp: number;

    // ========================================================================
    // PAYLOAD
    // ========================================================================

    /**
     * Datos específicos del comando.
     * El tipo concreto depende del commandType.
     * Debe contener solo lo mínimo necesario.
     */
    readonly payload: TPayload;
}

// ============================================================================
// RESULTADO DE COMANDO
// ============================================================================

/**
 * Resultado de la ejecución de un comando.
 * 
 * Solo dos estados posibles:
 * - accepted: el comando fue procesado exitosamente
 * - rejected: el comando fue rechazado con razón tipada
 */
export type CommandResult<TReceipt = unknown> =
    | CommandAccepted<TReceipt>
    | CommandRejected;

/**
 * Comando aceptado.
 * El backend procesó el comando exitosamente.
 */
export interface CommandAccepted<TReceipt = unknown> {
    readonly status: 'accepted';
    readonly commandId: CommandId;
    readonly serverTimestamp: number;
    /** Recibo o resultado del comando */
    readonly receipt: TReceipt;
}

/**
 * Comando rechazado.
 * El backend rechazó el comando con razón explícita.
 */
export interface CommandRejected {
    readonly status: 'rejected';
    readonly commandId: CommandId;
    readonly serverTimestamp: number;
    /** Código de rechazo tipado */
    readonly rejectionCode: RejectionCode;
    /** Mensaje humano (solo para debugging) */
    readonly message: string;
}

// ============================================================================
// CÓDIGOS DE RECHAZO
// ============================================================================

/**
 * Códigos de rechazo tipados.
 * 
 * Cada rechazo tiene una razón explícita que el cliente
 * puede manejar programáticamente.
 */
export type RejectionCode =
    // Autenticación/Autorización
    | 'UNAUTHORIZED'           // No autenticado
    | 'FORBIDDEN'              // Sin capacidad
    | 'COMPANY_SUSPENDED'      // Empresa suspendida
    | 'USER_SUSPENDED'         // Usuario suspendido
    | 'MODULE_DISABLED'        // Módulo no activo
    // Idempotencia
    | 'DUPLICATE_COMMAND'      // commandId ya procesado
    // Precondiciones
    | 'INVALID_STATE'          // Estado no permite la acción
    | 'PRECONDITION_FAILED'    // Precondición específica falló
    | 'RESOURCE_NOT_FOUND'     // Recurso no existe
    | 'RESOURCE_LOCKED'        // Recurso bloqueado
    // Validación
    | 'INVALID_PAYLOAD'        // Payload inválido
    | 'VERSION_MISMATCH'       // Versión de comando no soportada
    // Técnico
    | 'INTERNAL_ERROR';        // Error interno (retry posible)

// ============================================================================
// HELPERS (SOLO DEFINICIONES)
// ============================================================================

/**
 * Verifica si un resultado es aceptado.
 */
export function isAccepted<T>(result: CommandResult<T>): result is CommandAccepted<T> {
    return result.status === 'accepted';
}

/**
 * Verifica si un resultado es rechazado.
 */
export function isRejected(result: CommandResult): result is CommandRejected {
    return result.status === 'rejected';
}

/**
 * Lista de todos los tipos de comando canónicos.
 */
export const CANONICAL_COMMAND_TYPES: readonly CommandType[] = Object.freeze([
    // Turnos
    'shift.open',
    'shift.close',
    'shift.close.supervised',
    // Incidentes
    'incident.create',
    'incident.close',
    // Rondines
    'rondin.start',
    'rondin.recordCheckpoint',
    'rondin.finish',
    // Checklists
    'checklist.submit',
    // Control de accesos
    'access.registerEntry',
    'access.registerExit',
    // Control vehicular
    'vehicle.registerEntry',
    'vehicle.registerExit',
    // Evidencias
    'evidence.attach',
    // Puntos de control
    'checkpoint.create',
    'checkpoint.disable'
]);

/**
 * Verifica si un string es un tipo de comando válido.
 */
export function isValidCommandType(value: string): value is CommandType {
    return CANONICAL_COMMAND_TYPES.includes(value as CommandType);
}
