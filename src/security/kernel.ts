/**
 * @fileoverview Security Kernel Contract
 * @module security/kernel
 * 
 * FASE 2 - PASO 3: CONTRATO DEL SECURITY KERNEL
 * 
 * Este archivo define la INTERFAZ del SecurityKernel.
 * La implementación se encuentra en ./kernel.impl.ts
 * 
 * @see ./kernel.impl.ts para DenyAllSecurityKernel
 */

import { RequestContext, AuthContext } from './auth/types';
import { AccessPolicy, AuthorizationResult } from './policies/contracts';

/**
 * SecurityKernel
 * Punto de entrada ÚNICO para todas las decisiones de seguridad del sistema.
 * Nadie fuera de este módulo debe instanciar Guards o Evaluadores directamente.
 *
 * Principio: "Backend como autoridad única" (Invariantes #21)
 * 
 * @invariant Deny by default - toda operación no autorizada explícitamente se rechaza
 * @invariant El cliente es hostil por diseño - no confiar en datos del cliente
 */
export interface SecurityKernel {
    /**
     * Identifica al usuario basado en el contexto de la solicitud cruda.
     * No lanza excepciones, regresa un AuthContext (que puede ser Anonymous o Invalid).
     * 
     * TODO [FASE 2 - Autenticación Real]:
     * - Integrar con Firebase Auth Admin SDK
     * - Verificar token JWT contra Firebase
     * - Extraer claims personalizados (role, companyId)
     * - Manejar tokens expirados/revocados explícitamente
     */
    authenticate(context: RequestContext): Promise<AuthContext>;

    /**
     * Evalúa si el contexto actual tiene permiso para la política solicitada.
     * "Deny by default": Si falla, regresa AuthorizationResult con allowed: false.
     * 
     * TODO [FASE 2 - Autorización Real]:
     * - Implementar PolicyEvaluator concreto
     * - Evaluar capacidades basadas en rol
     * - Verificar aislamiento por companyId
     * - Registrar decisión en auditoría
     */
    authorize(context: AuthContext, policy: AccessPolicy): Promise<AuthorizationResult>;

    /**
     * Método de conveniencia para "Fail Fast".
     * Lanza SecurityViolation si no está autorizado.
     * 
     * TODO [FASE 2 - Assert]:
     * - Implementar como wrapper de authorize()
     * - Lanzar SecurityViolation con código apropiado
     * - NO exponer detalles internos en mensaje de error
     */
    assertAuthorized(context: AuthContext, policy: AccessPolicy): Promise<void>;
}

/**
 * FASE 2 - PASO 3: IMPLEMENTACIÓN COMPLETADA
 * 
 * ✅ DenyAllSecurityKernel implementado en ./kernel.impl.ts
 * ✅ authenticate() → siempre AnonymousIdentity
 * ✅ authorize() → siempre { allowed: false }
 * ✅ assertAuthorized() → siempre lanza SecurityViolation
 * 
 * PENDIENTE para pasos futuros:
 * - [ ] FirebaseSecurityKernel con autenticación real
 * - [ ] Inyección de dependencia para Firebase Admin Auth
 * - [ ] Integración con PolicyEvaluator concreto
 * - [ ] Conexión con sistema de auditoría
 */
