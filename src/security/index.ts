/**
 * @fileoverview Security Module Public API
 * @module security
 * 
 * FASE 2 - PASO 6
 * Exportaciones públicas del módulo de seguridad.
 */

// Contrato
export type { SecurityKernel } from './kernel';

// Implementaciones (placeholder/local)
export {
    AuthenticatingSecurityKernel,
    DenyAllSecurityKernel,
    createSecurityKernel,
    createDenyAllKernel
} from './kernel.impl';

// Implementación con Firebase Auth
export {
    FirebaseSecurityKernel,
    createFirebaseSecurityKernel
} from './kernel.firebase';

// Firebase Auth utilities
export {
    initializeFirebaseAuth,
    getFirebaseAuth,
    isFirebaseInitialized
} from './auth/firebase';

// Tipos de autenticación
export type {
    UserId,
    CompanyId,
    UserRole,
    CompanyStatus,
    UserIdentity,
    AnonymousIdentity,
    AuthenticatedIdentity,
    InvalidIdentity,
    RuntimeIdentity,
    AuthContext,
    RequestContext
} from './auth/types';

// Tipos y políticas canónicas
export type {
    PermissionAction,
    ResourceType,
    AccessPolicy,
    AuthorizationResult,
    PolicyEvaluator
} from './policies/contracts';

export {
    POLICY_ALLOW_AUTHENTICATED,
    isPolicyAllowAuthenticated
} from './policies/contracts';

// Guards
export type { SecurityGuard } from './guards/contracts';
export { SecurityViolation } from './guards/contracts';
