import { UserIdentity } from '../auth/types';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute';
export type ResourceType = 'shift' | 'patrol' | 'incident' | 'company' | 'user';

export interface AccessPolicy {
    readonly resource: ResourceType;
    readonly action: PermissionAction;
}

export type AuthorizationResult =
    | { allowed: true }
    | { allowed: false; reason: string; code: 'DENIED_BY_POLICY' | 'INSUFFICIENT_ROLE' | 'INVALID_CONTEXT' };

// Contrato para evaluadores de políticas.
// NO debe tener efectos secundarios.
// Debe ser determinista.
export interface PolicyEvaluator {
    evaluate(user: UserIdentity, policy: AccessPolicy): Promise<AuthorizationResult>;
}
