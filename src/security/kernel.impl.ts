/**
 * @fileoverview Deny-All Security Kernel Implementation
 * @module security/kernel.impl
 * 
 * FASE 2 - PASO 3: IMPLEMENTACIÓN MÍNIMA
 * 
 * Esta implementación:
 * - DENIEGA TODO por defecto
 * - NO autentica a nadie (siempre Anonymous)
 * - NO depende de Firebase
 * - NO lee headers, cookies o tokens
 * - NO persiste estado
 * 
 * Principios del Canon aplicados:
 * - "Deny by default" (SISTEMA_CANONICO_FINAL.md §14)
 * - "El cliente es hostil por diseño" (INVARIANTES_DE_PRODUCCION.md)
 * - "Backend como autoridad única"
 */

import { SecurityKernel } from './kernel';
import { RequestContext, AuthContext, AnonymousIdentity } from './auth/types';
import { AccessPolicy, AuthorizationResult } from './policies/contracts';
import { SecurityViolation } from './guards/contracts';

/**
 * Identidad anónima singleton.
 * Usada para todas las solicitudes en esta implementación mínima.
 */
const ANONYMOUS_IDENTITY: AnonymousIdentity = Object.freeze({
    kind: 'anonymous' as const
});

/**
 * Resultado de denegación por defecto.
 * Usado para todas las autorizaciones en esta implementación mínima.
 */
const DENY_BY_DEFAULT: AuthorizationResult = Object.freeze({
    allowed: false,
    reason: 'Sistema en modo deny-all. Autenticación real no implementada.',
    code: 'DENIED_BY_POLICY' as const
});

/**
 * DenyAllSecurityKernel
 * 
 * Implementación mínima del SecurityKernel que:
 * - Siempre devuelve AnonymousIdentity en authenticate()
 * - Siempre deniega en authorize()
 * - Siempre lanza SecurityViolation en assertAuthorized()
 * 
 * Esta implementación existe para:
 * 1. Verificar que el contrato compila
 * 2. Establecer el patrón "deny by default"
 * 3. Permitir desarrollo incremental sin bypasses
 * 
 * @invariant NUNCA permite acceso
 * @invariant NO tiene dependencias externas
 * @invariant NO muta estado
 */
export class DenyAllSecurityKernel implements SecurityKernel {
    /**
     * Siempre devuelve identidad anónima.
     * 
     * En implementaciones futuras:
     * - Leerá el token del RequestContext
     * - Verificará contra Firebase Auth
     * - Devolverá AuthenticatedIdentity o InvalidIdentity
     * 
     * @param _context - Contexto de la solicitud (ignorado en esta implementación)
     * @returns AuthContext con AnonymousIdentity
     */
    async authenticate(_context: RequestContext): Promise<AuthContext> {
        // No leemos headers, cookies ni tokens
        // Simplemente devolvemos identidad anónima
        return {
            identity: ANONYMOUS_IDENTITY
        };
    }

    /**
     * Siempre deniega la autorización.
     * 
     * En implementaciones futuras:
     * - Verificará si la identidad es autenticada
     * - Evaluará políticas basadas en rol
     * - Verificará aislamiento de tenant
     * 
     * @param _context - Contexto de autenticación (ignorado)
     * @param _policy - Política a evaluar (ignorado)
     * @returns AuthorizationResult con allowed: false
     */
    async authorize(
        _context: AuthContext,
        _policy: AccessPolicy
    ): Promise<AuthorizationResult> {
        // Deny by default - no evaluamos nada
        return DENY_BY_DEFAULT;
    }

    /**
     * Siempre lanza SecurityViolation.
     * 
     * Wrapper de authorize() que lanza excepción en lugar de devolver resultado.
     * Útil para "fail fast" en flujos que requieren autorización.
     * 
     * @param context - Contexto de autenticación
     * @param policy - Política a evaluar
     * @throws SecurityViolation siempre
     */
    async assertAuthorized(
        context: AuthContext,
        policy: AccessPolicy
    ): Promise<void> {
        const result = await this.authorize(context, policy);

        if (!result.allowed) {
            throw new SecurityViolation(
                result.reason,
                result.code
            );
        }

        // Este punto nunca se alcanza en DenyAllSecurityKernel
        // pero la estructura está lista para implementación real
    }
}

/**
 * Factory function para crear instancia del kernel.
 * 
 * En implementaciones futuras, esta función podría:
 * - Recibir configuración de Firebase
 * - Inyectar PolicyEvaluator
 * - Configurar auditoría
 * 
 * @returns Instancia de SecurityKernel que deniega todo
 */
export function createSecurityKernel(): SecurityKernel {
    return new DenyAllSecurityKernel();
}
