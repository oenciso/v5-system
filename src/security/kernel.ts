import { RequestContext, AuthContext } from './auth/types';
import { AccessPolicy, AuthorizationResult } from './policies/contracts';

/**
 * SecurityKernel
 * Punto de entrada ÚNICO para todas las decisiones de seguridad del sistema.
 * Nadie fuera de este módulo debe instanciar Guards o Evaluadores directamente.
 *
 * Principio: "Backend como autoridad única" (Invariantes #21)
 */
export interface SecurityKernel {
    /**
     * Identifica al usuario basado en el contexto de la solicitud cruda.
     * No lanza excepciones, regresa un AuthContext (que puede ser Anonymous o Invalid).
     */
    authenticate(context: RequestContext): Promise<AuthContext>;

    /**
     * Evalúa si el contexto actual tiene permiso para la política solicitada.
     * "Deny by default": Si falla, regresa AuthorizationResult con allowed: false.
     */
    authorize(context: AuthContext, policy: AccessPolicy): Promise<AuthorizationResult>;

    /**
     * Método de conveniencia para "Fail Fast".
     * Lanza SecurityViolation si no está autorizado.
     */
    assertAuthorized(context: AuthContext, policy: AccessPolicy): Promise<void>;
}
