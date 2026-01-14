/**
 * @fileoverview Access Policy Contracts
 * @module security/policies/contracts
 * 
 * FASE 2 - PASO 1: PREPARACIÓN
 * Contratos para evaluación de políticas de acceso.
 * Define QUÉ se evalúa, no CÓMO se evalúa.
 */

import { UserIdentity } from '../auth/types';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute';
export type ResourceType = 'shift' | 'patrol' | 'incident' | 'company' | 'user';

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
    | { allowed: false; reason: string; code: 'DENIED_BY_POLICY' | 'INSUFFICIENT_ROLE' | 'INVALID_CONTEXT' | 'TENANT_ISOLATION' };

/**
 * Contrato para evaluadores de políticas.
 * NO debe tener efectos secundarios.
 * Debe ser determinista.
 * 
 * TODO [FASE 2 - PolicyEvaluator Implementation]:
 * - Implementar RoleBasedPolicyEvaluator
 * - Matriz de permisos por rol
 * - Validación de companyId para aislamiento de tenant
 * - Logging de decisiones (no mutación)
 * 
 * PENDIENTE - NO IMPLEMENTAR EN PASO 1:
 * - [ ] Clase concreta que implementa PolicyEvaluator
 * - [ ] Inyección en SecurityKernel
 * - [ ] Tests unitarios de decisiones
 */
export interface PolicyEvaluator {
    evaluate(user: UserIdentity, policy: AccessPolicy): Promise<AuthorizationResult>;
}
