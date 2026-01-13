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

// Representa el contexto crudo de una solicitud antes de validarse
export interface RequestContext {
  readonly ip: string;
  readonly timestamp: number;
  // Tokens u otros headers vendrían aquí, pero no se procesan en esta interfaz
}
