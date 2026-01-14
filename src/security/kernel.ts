/**
 * @fileoverview Security Kernel Contract
 * @module security/kernel
 * 
 * FASE 2 - PASO 1: PREPARACIÓN
 * Este archivo contiene SOLO el contrato del SecurityKernel.
 * La implementación real se agregará en pasos posteriores de la Fase 2.
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
 * TODO [FASE 2 - Implementación del Kernel]:
 * 
 * PENDIENTE - NO IMPLEMENTAR EN PASO 1:
 * - [ ] Clase FirebaseSecurityKernel que implementa SecurityKernel
 * - [ ] Inyección de dependencia para Firebase Admin Auth
 * - [ ] Integración con PolicyEvaluator concreto
 * - [ ] Conexión con sistema de auditoría
 * 
 * PRERREQUISITOS:
 * - Firebase Admin SDK configurado
 * - Variables de entorno para credenciales
 * - Estructura de Cloud Functions definida
 */
