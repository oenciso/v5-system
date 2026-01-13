export type UserId = string;
export type CompanyId = string;
export type UserRole = 'superadmin' | 'admin' | 'supervisor' | 'guard';

export interface UserIdentity {
    readonly uid: UserId;
    readonly companyId: CompanyId;
    readonly role: UserRole;
    readonly email: string;
    readonly isEmailVerified: boolean;
}

export interface AnonymousIdentity {
    readonly kind: 'anonymous';
}

export interface AuthenticatedIdentity extends UserIdentity {
    readonly kind: 'authenticated';
    readonly authTime: number;
}

export interface InvalidIdentity {
    readonly kind: 'invalid';
    readonly reason: 'expired' | 'malformed' | 'revoked';
}

export type RuntimeIdentity = AuthenticatedIdentity | AnonymousIdentity | InvalidIdentity;

export interface AuthContext {
    readonly identity: RuntimeIdentity;
    readonly token?: string; // Present only during transit, stripped in logic
}

// Representa el contexto crudo de una solicitud antes de validarse
export interface RequestContext {
    readonly ip: string;
    readonly timestamp: number;
    // Tokens u otros headers vendrían aquí, pero no se procesan en esta interfaz
}
