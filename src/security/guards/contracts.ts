/**
 * @fileoverview Security Guard Contracts
 * @module security/guards/contracts
 * 
 * FASE 2 - PASO 1: PREPARACIÓN
 * Contratos para guards de seguridad.
 * Guards son la última barrera antes de ejecución de lógica de negocio.
 */

import { AuthorizationResult } from '../policies/contracts';

/**
 * Guard de seguridad - Barrera final antes de ejecución.
 * 
 * @invariant DEBE fallar cerrado (Deny by Default)
 * @invariant NO debe mutar estado
 * @invariant Solo valida, no ejecuta lógica de negocio
 * 
 * TODO [FASE 2 - Guard Implementation]:
 * - AuthenticatedGuard: Requiere identidad autenticada
 * - RoleGuard: Requiere rol mínimo
 * - TenantGuard: Valida aislamiento de empresa
 * - CompoundGuard: Composición de múltiples guards
 * 
 * PENDIENTE - NO IMPLEMENTAR EN PASO 1:
 * - [ ] Clases concretas de guards
 * - [ ] Factory para construcción de guards
 * - [ ] Integración con SecurityKernel
 */
export interface SecurityGuard {
    canActivate(): Promise<AuthorizationResult>;
}

/**
 * Representa un rechazo explícito y seguro.
 * 
 * @security NO debe exponer detalles internos en mensaje de producción
 * 
 * TODO [FASE 2 - Error Handling]:
 * - Sanitizar mensajes antes de enviar al cliente
 * - Logging interno con detalle completo
 * - Códigos de error estandarizados para auditoría
 */
export class SecurityViolation extends Error {
    constructor(
        public readonly reason: string,
        public readonly code: string
    ) {
        super(`Security Violation: ${code} - ${reason}`);
        this.name = 'SecurityViolation';
    }
}
