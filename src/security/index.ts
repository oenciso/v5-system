/**
 * @fileoverview Security Module Public API
 * @module security
 * 
 * FASE 2 - PASO 10
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

// Módulos y capacidades canónicas (PASO 10)
export type {
    SystemModule,
    CoreCapability,
    IncidentCapability,
    PatrolCapability,
    ChecklistCapability,
    AccessControlCapability,
    VehicleControlCapability,
    EvidenceCapability,
    CheckpointCapability,
    Capability,
    ModuleCapability
} from './modules/definitions';

export {
    CANONICAL_MODULES,
    CAPABILITIES_BY_MODULE,
    isValidModule,
    isCapabilityInModule
} from './modules/definitions';

// Perfiles y delegación (PASO 11)
export type {
    OperativeProfile,
    RoleDelegationCeiling
} from './modules/capabilities';

export {
    // Categorías de capacidades
    OPERATION_CAPABILITIES,
    ADMIN_CAPABILITIES,
    SUPERVISION_CAPABILITIES,
    // Perfiles operativos
    PROFILE_RONDINERO,
    PROFILE_GUARDIA_ACCESOS,
    PROFILE_GUARDIA_GENERAL,
    CANONICAL_PROFILES,
    // Techos de delegación
    CEILING_SUPERADMIN,
    CEILING_ADMIN,
    CEILING_SUPERVISOR,
    CEILING_GUARD,
    DELEGATION_CEILINGS,
    // Funciones de consulta
    getDelegationCeiling,
    canRoleDelegateTo,
    canRoleDelegateCapability,
    getRoleLevel,
    isRoleSuperior
} from './modules/capabilities';
