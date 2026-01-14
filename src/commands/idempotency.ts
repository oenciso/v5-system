/**
 * @fileoverview Idempotency Model Contracts
 * @module commands/idempotency
 * 
 * FASE 3 - PASO 2: MODELO DE IDEMPOTENCIA (solo definición)
 * 
 * Este archivo define el CONTRATO canónico para idempotencia de comandos.
 * Garantiza que un comando con el mismo commandId se procese como máximo una vez.
 * 
 * Fuente: SISTEMA_CANONICO_v1.9.md §9.4
 * 
 * Principios canónicos:
 * - Cada `commandId` se procesa una sola vez.
 * - Reintentos devuelven el mismo resultado.
 * - La idempotencia es obligatoria para offline-first.
 * 
 * IMPORTANTE:
 * - Este archivo define SOLO el contrato
 * - NO hay persistencia (lectura/escritura)
 * - NO hay ejecución de comandos
 * - NO hay lógica de base de datos
 */

import { CompanyId } from '../security/auth/types';
import { CommandId, RejectionCode } from './contracts';

// ============================================================================
// TIPOS BASE DE IDEMPOTENCIA
// ============================================================================

/**
 * Clave de idempotencia compuesta.
 * 
 * La clave combina commandId + companyId para:
 * - Garantizar unicidad dentro del tenant
 * - Permitir aislamiento de empresas en la misma tabla
 * - Evitar colisiones entre comandos de diferentes empresas
 * 
 * @invariant commandId es único por empresa
 * @invariant companyId aisla comandos por tenant
 */
export interface IdempotencyKey {
    /** ID único del comando (generado por cliente) */
    readonly commandId: CommandId;
    /** ID de la empresa (tenant isolation) */
    readonly companyId: CompanyId;
}

/**
 * Estado del registro de idempotencia.
 * 
 * Estados posibles:
 * - PENDING: El comando está siendo procesado (in-flight)
 * - ACCEPTED: El comando fue procesado exitosamente
 * - REJECTED: El comando fue rechazado
 * 
 * Diagrama de transición:
 *   (nuevo) → PENDING → ACCEPTED
 *                    ↘ REJECTED
 * 
 * @invariant Una vez ACCEPTED o REJECTED, el estado no cambia
 * @invariant PENDING indica procesamiento en curso
 */
export type IdempotencyStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

// ============================================================================
// REGISTRO DE IDEMPOTENCIA
// ============================================================================

/**
 * Registro de idempotencia completo.
 * 
 * Almacena el estado y resultado de un comando procesado.
 * Permite que reintentos devuelvan el resultado original sin re-ejecutar.
 * 
 * SISTEMA_CANONICO_v1.9.md §9.4:
 * > "Cada commandId se procesa una sola vez."
 * > "Reintentos devuelven el mismo resultado."
 * 
 * @invariant commandId + companyId son únicos globalmente
 * @invariant Una vez status !== 'PENDING', el registro es inmutable
 */
export interface IdempotencyRecord {
    // ========================================================================
    // IDENTIFICACIÓN (clave primaria)
    // ========================================================================

    /** ID único del comando */
    readonly commandId: CommandId;

    /** ID de la empresa (tenant isolation) */
    readonly companyId: CompanyId;

    // ========================================================================
    // ESTADO DE PROCESAMIENTO
    // ========================================================================

    /** Estado actual del comando */
    readonly status: IdempotencyStatus;

    /** Timestamp de creación del registro (Unix ms) */
    readonly createdAt: number;

    /** 
     * Timestamp de resolución (Unix ms).
     * undefined si status === 'PENDING'
     */
    readonly resolvedAt?: number;

    // ========================================================================
    // RESULTADO (solo si status !== 'PENDING')
    // ========================================================================

    /**
     * Código de resultado.
     * - 'SUCCESS' si status === 'ACCEPTED'
     * - RejectionCode específico si status === 'REJECTED'
     * - undefined si status === 'PENDING'
     */
    readonly resultCode?: IdempotencyResultCode;
}

/**
 * Códigos de resultado para el registro de idempotencia.
 * 
 * SUCCESS indica aceptación exitosa.
 * Cualquier otro valor es un código de rechazo tipado.
 */
export type IdempotencyResultCode = 'SUCCESS' | RejectionCode;

// ============================================================================
// COMPORTAMIENTO CON DUPLICADOS (DECLARATIVO)
// ============================================================================

/**
 * Comportamiento esperado cuando se recibe un comando duplicado.
 * 
 * SISTEMA_CANONICO_v1.9.md §9.4:
 * > "Reintentos devuelven el mismo resultado."
 * 
 * Reglas de comportamiento:
 * 
 * 1. COMANDO NO EXISTE EN IDEMPOTENCIA:
 *    → Crear registro con status = 'PENDING'
 *    → Procesar comando normalmente
 *    → Actualizar registro con resultado final
 * 
 * 2. COMANDO EXISTE CON status = 'PENDING' (in-flight):
 *    → Rechazar inmediatamente con DUPLICATE_COMMAND
 *    → El cliente debe esperar y reintentar
 *    → NO re-procesar el comando
 * 
 * 3. COMANDO EXISTE CON status = 'ACCEPTED':
 *    → Devolver el resultado original guardado
 *    → NO re-procesar el comando
 * 
 * 4. COMANDO EXISTE CON status = 'REJECTED':
 *    → Devolver el rechazo original
 *    → NO re-procesar el comando
 * 
 * @see IdempotencyBehavior para tipos discriminados
 */
export type DuplicateBehavior =
    | 'CREATE_AND_PROCESS'     // Caso 1: comando nuevo
    | 'REJECT_IN_FLIGHT'       // Caso 2: comando en proceso
    | 'RETURN_CACHED_SUCCESS'  // Caso 3: comando ya aceptado
    | 'RETURN_CACHED_REJECTION'; // Caso 4: comando ya rechazado

/**
 * Resultado de verificar idempotencia.
 * 
 * Discriminated union que indica cómo proceder con un comando.
 */
export type IdempotencyCheckResult =
    | IdempotencyNew
    | IdempotencyInFlight
    | IdempotencyCached;

/**
 * Comando nuevo - no existe registro previo.
 * 
 * Acción: crear registro PENDING y procesar comando.
 */
export interface IdempotencyNew {
    readonly behavior: 'CREATE_AND_PROCESS';
}

/**
 * Comando en vuelo - otro proceso lo está ejecutando.
 * 
 * Acción: rechazar con DUPLICATE_COMMAND.
 * 
 * INVARIANTES_DE_PRODUCCION.md:
 * > "El cliente es hostil por diseño."
 * 
 * Esto previene ataques de replay y doble-envío accidental.
 */
export interface IdempotencyInFlight {
    readonly behavior: 'REJECT_IN_FLIGHT';
    readonly record: IdempotencyRecord;
}

/**
 * Comando ya procesado - resultado en caché.
 * 
 * Acción: devolver resultado original sin re-ejecutar.
 */
export interface IdempotencyCached {
    readonly behavior: 'RETURN_CACHED_SUCCESS' | 'RETURN_CACHED_REJECTION';
    readonly record: IdempotencyRecord;
}

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * TTL predeterminado para registros de idempotencia (en ms).
 * 
 * INVARIANTES_DE_PRODUCCION.md:
 * > "TTL obligatorio para comandos."
 * 
 * Después de este tiempo, el registro puede ser eliminado.
 * Los comandos con commandId expirado se tratan como nuevos.
 * 
 * Valor: 24 horas (suficiente para offline)
 */
export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * TTL para comandos en estado PENDING (timeout).
 * 
 * Si un comando permanece PENDING más allá de este tiempo,
 * se considera abandonado y puede ser reprocesado.
 * 
 * Valor: 5 minutos (suficiente para procesamiento normal)
 */
export const PENDING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// TYPE GUARDS (SOLO DEFINICIONES)
// ============================================================================

/**
 * Verifica si el resultado indica un comando nuevo.
 */
export function isNewCommand(result: IdempotencyCheckResult): result is IdempotencyNew {
    return result.behavior === 'CREATE_AND_PROCESS';
}

/**
 * Verifica si el resultado indica un comando en vuelo.
 */
export function isInFlight(result: IdempotencyCheckResult): result is IdempotencyInFlight {
    return result.behavior === 'REJECT_IN_FLIGHT';
}

/**
 * Verifica si el resultado indica un comando en caché.
 */
export function isCached(result: IdempotencyCheckResult): result is IdempotencyCached {
    return result.behavior === 'RETURN_CACHED_SUCCESS' ||
        result.behavior === 'RETURN_CACHED_REJECTION';
}

/**
 * Crea una clave de idempotencia a partir de commandId y companyId.
 */
export function createIdempotencyKey(commandId: CommandId, companyId: CompanyId): IdempotencyKey {
    return Object.freeze({ commandId, companyId });
}
