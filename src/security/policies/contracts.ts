/**
 * @fileoverview Access Policy Contracts
 * @module security/policies/contracts
 * 
 * FASE 2 - PASO 5: AUTORIZACIÓN MÍNIMA
 * Contratos y políticas canónicas para evaluación de acceso.
 */

import { UserIdentity } from '../auth/types';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute';
export type ResourceType = 'shift' | 'patrol' | 'incident' | 'company' | 'user' | 'system';

/**
 * Política de acceso a evaluar.
 * Representa la intención de acceder a un recurso con una acción específica.
 */
export interface AccessPolicy {
    readonly resource: ResourceType;
    readonly action: PermissionAction;
}

/**
 * Resultado de evaluación de autorización.
 * Siempre es determinista: allowed: true | allowed: false con razón.
 * 
 * @invariant Deny by default - si no está explícitamente permitido, está denegado
 */
export type AuthorizationResult =
    | { allowed: true }
    | { allowed: false; reason: string; code: 'DENIED_BY_POLICY' | 'INSUFFICIENT_ROLE' | 'INVALID_CONTEXT' | 'TENANT_ISOLATION' | 'ANONYMOUS_NOT_ALLOWED' };

/**
 * Contrato para evaluadores de políticas.
 * NO debe tener efectos secundarios.
 * Debe ser determinista.
 */
export interface PolicyEvaluator {
    evaluate(user: UserIdentity, policy: AccessPolicy): Promise<AuthorizationResult>;
}

// ============================================================================
// POLÍTICAS CANÓNICAS MÍNIMAS
// ============================================================================

/**
 * Política: ALLOW_AUTHENTICATED
 * 
 * Objetivo: Permitir acceso a cualquier usuario autenticado.
 * Uso: Verificar que el usuario tiene identidad válida antes de procesar.
 * 
 * Esta es la política más básica del sistema.
 * NO verifica rol, empresa, ni permisos específicos.
 * Solo verifica que la identidad sea AuthenticatedIdentity.
 */
export const POLICY_ALLOW_AUTHENTICATED: AccessPolicy = Object.freeze({
    resource: 'system' as const,
    action: 'read' as const
});

/**
 * Verifica si una política coincide con la política ALLOW_AUTHENTICATED.
 * 
 * @param policy - Política a verificar
 * @returns true si es la política ALLOW_AUTHENTICATED
 */
export function isPolicyAllowAuthenticated(policy: AccessPolicy): boolean {
    return policy.resource === 'system' && policy.action === 'read';
}
