/**
 * @fileoverview Security Module Public API
 * @module security
 * 
 * FASE 2 - PASO 3
 * Exportaciones públicas del módulo de seguridad.
 */

// Contrato
export type { SecurityKernel } from './kernel';

// Implementación
export { DenyAllSecurityKernel, createSecurityKernel } from './kernel.impl';

// Tipos de autenticación
export type {
    UserId,
    CompanyId,
    UserRole,
    UserIdentity,
    AnonymousIdentity,
    AuthenticatedIdentity,
    InvalidIdentity,
    RuntimeIdentity,
    AuthContext,
    RequestContext
} from './auth/types';

// Tipos de políticas
export type {
    PermissionAction,
    ResourceType,
    AccessPolicy,
    AuthorizationResult,
    PolicyEvaluator
} from './policies/contracts';

// Guards
export type { SecurityGuard } from './guards/contracts';
export { SecurityViolation } from './guards/contracts';
