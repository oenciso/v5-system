/**
 * @fileoverview Domain Command Contracts
 * @module domain/commands/contracts
 * 
 * FASE 2 - PASO 1: PREPARACIÓN
 * Contratos para el sistema de comandos de dominio.
 * SOLO tipos e interfaces - NO HAY IMPLEMENTACIÓN.
 * 
 * Principios del Canon aplicados:
 * - "Toda mutación ocurre por comandos" (SISTEMA_CANONICO_FINAL.md §9)
 * - "Comandos son inmutables, idempotentes y auditables"
 * - "Backend decide siempre"
 */

import { UserId, CompanyId } from '../../security/auth/types';

/**
 * Identificador único de comando para idempotencia.
 * Generado por el cliente, validado por el backend.
 */
export type CommandId = string;

/**
 * Tipos de comando soportados por el sistema.
 * Se expandirá conforme avancen las fases.
 * 
 * TODO [FASE 2 - Paso 2+]: Agregar tipos según se implementen
 */
export type CommandType =
    | 'shift.open'
    | 'shift.close'
    // Placeholder para futuros comandos
    ;

/**
 * Metadatos de origen del comando.
 * Captura contexto para auditoría y debugging.
 */
export interface CommandOrigin {
    readonly issuedBy: UserId;
    readonly issuedAt: number; // Unix timestamp
    readonly companyId: CompanyId;
    readonly deviceId?: string;
    readonly clientVersion?: string;
}

/**
 * Estructura base de un comando de dominio.
 * Todo comando DEBE implementar esta interfaz.
 * 
 * @invariant commandId debe ser único para idempotencia
 * @invariant Los campos son readonly - comandos son inmutables
 */
export interface DomainCommand<TPayload = unknown> {
    readonly commandId: CommandId;
    readonly type: CommandType;
    readonly origin: CommandOrigin;
    readonly payload: TPayload;
}

/**
 * Resultado de procesamiento de comando.
 * Siempre es explícito: accepted o rejected.
 */
export type CommandResult<TEvent = unknown> =
    | { status: 'accepted'; eventId: string; event: TEvent }
    | { status: 'rejected'; reason: string; code: CommandRejectionCode };

/**
 * Códigos de rechazo tipados.
 * Permite manejo determinista de errores.
 */
export type CommandRejectionCode =
    | 'UNAUTHORIZED'
    | 'INVALID_STATE'
    | 'DUPLICATE_COMMAND'
    | 'VALIDATION_FAILED'
    | 'TENANT_MISMATCH'
    | 'EXPIRED_COMMAND';

/**
 * TODO [FASE 2 - Infraestructura de Comandos]:
 * 
 * PENDIENTE - NO IMPLEMENTAR EN PASO 1:
 * - [ ] CommandGateway: Punto de entrada para comandos (Cloud Function)
 * - [ ] IdempotencyStore: Tabla para detectar duplicados
 * - [ ] CommandValidator: Validación de estructura y permisos
 * - [ ] CommandAuditor: Registro inmutable de comandos
 * - [ ] CommandHandler<T>: Interfaz para handlers específicos
 * 
 * PRERREQUISITOS:
 * - SecurityKernel implementado
 * - Firebase Admin SDK configurado
 * - Estructura de Firestore definida
 * 
 * PROHIBICIONES:
 * - NO ejecutar comandos sin pasar por SecurityKernel
 * - NO mutar estado sin registrar en auditoría
 * - NO aceptar comandos sin validar idempotencia
 */
