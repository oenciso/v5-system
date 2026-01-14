/**
 * @fileoverview Core Authentication Types
 * @module security/auth/types
 * 
 * FASE 2 - PASO 1: PREPARACIÓN
 * Tipos e interfaces para el subsistema de autenticación.
 * Estos tipos definen el CONTRATO, no la implementación.
 */

export type UserId = string;
export type CompanyId = string;
export type UserRole = 'superadmin' | 'admin' | 'supervisor' | 'guard';

/**
 * Identidad de usuario verificada e inmutable.
 * Solo el backend puede construir instancias válidas de UserIdentity.
 * 
 * TODO [FASE 2 - Firebase Integration]:
 * - Mapear desde Firebase Auth DecodedIdToken
 * - Extraer custom claims (role, companyId)
 * - Validar que companyId exista en Firestore
 */
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

/**
 * Identidad autenticada con metadatos de sesión.
 * 
 * TODO [FASE 2 - Token Validation]:
 * - authTime debe venir del token decodificado
 * - Comparar con tiempo de revocación del usuario
 */
export interface AuthenticatedIdentity extends UserIdentity {
    readonly kind: 'authenticated';
    readonly authTime: number;
}

/**
 * Estado explícito de identidad inválida.
 * Nunca usar null/undefined para representar invalidad.
 */
export interface InvalidIdentity {
    readonly kind: 'invalid';
    readonly reason: 'expired' | 'malformed' | 'revoked';
}

/**
 * Discriminated Union para manejar todos los estados de identidad.
 * El sistema DEBE manejar los tres casos explícitamente.
 */
export type RuntimeIdentity = AuthenticatedIdentity | AnonymousIdentity | InvalidIdentity;

export interface AuthContext {
    readonly identity: RuntimeIdentity;
    readonly token?: string; // Present only during transit, stripped in logic
}

/**
 * Contexto crudo de una solicitud HTTP/HTTPS.
 * 
 * TODO [FASE 2 - Request Context]:
 * - Agregar bearer token desde Authorization header
 * - Agregar App Check token
 * - Agregar device fingerprint para auditoría
 */
export interface RequestContext {
    readonly ip: string;
    readonly timestamp: number;
    // TODO: readonly authorizationHeader?: string;
    // TODO: readonly appCheckToken?: string;
}
