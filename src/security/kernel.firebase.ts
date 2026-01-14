/**
 * @fileoverview Firebase-backed Security Kernel Implementation
 * @module security/kernel.firebase
 * 
 * FASE 2 - PASO 9: RESOLUCIÓN MÍNIMA DE ROLES
 * 
 * Esta implementación:
 * - VERIFICA tokens reales con Firebase Auth
 * - RESUELVE identidad confiable (criptográficamente verificada)
 * - VALIDA que el usuario tenga companyId válido
 * - VALIDA que la empresa esté activa (companyStatus)
 * - VALIDA que el usuario tenga un rol canónico válido
 * - RECHAZA usuarios sin rol válido
 * - MANTIENE la autorización exactamente igual
 * - NO accede a Firestore
 * - NO persiste sesiones
 * 
 * Roles canónicos (SISTEMA_CANONICO_FINAL.md §4):
 * - superadmin: Super Administrador
 * - admin: Administrador
 * - supervisor: Supervisor
 * - guard: Guardia
 * 
 * Fuente de datos: Custom Claims del token de Firebase
 * - role: rol del usuario
 * - companyId: identificador de empresa
 * - companyStatus: estado de la empresa
 * 
 * LOS ROLES NO HABILITAN ACCIONES.
 * Los roles ordenan autoridad y delegación.
 * 
 * Qué valida:
 * - Firma criptográfica del token
 * - Expiración del token
 * - Existencia de companyId y rol en claims
 * - companyStatus === 'active'
 * 
 * Principios del Canon aplicados:
 * - "Deny by default"
 * - "El cliente es hostil por diseño"
 * - "Backend como autoridad única"
 * - "Roles ordenan poder, no habilitan acciones"
 */

import { SecurityKernel } from './kernel';
import {
    RequestContext,
    AuthContext,
    AnonymousIdentity,
    AuthenticatedIdentity,
    InvalidIdentity,
    UserRole,
    CompanyStatus
} from './auth/types';
import { AccessPolicy, AuthorizationResult, isPolicyAllowAuthenticated } from './policies/contracts';
import { SecurityViolation } from './guards/contracts';
import { initializeFirebaseAuth, type DecodedIdToken } from './auth/firebase';

// ============================================================================
// CONSTANTES DE RESULTADO
// ============================================================================

const ANONYMOUS_IDENTITY: AnonymousIdentity = Object.freeze({
    kind: 'anonymous' as const
});

const ALLOW: AuthorizationResult = Object.freeze({
    allowed: true
});

const DENY_UNKNOWN_POLICY: AuthorizationResult = Object.freeze({
    allowed: false,
    reason: 'Política no reconocida. Solo políticas explícitas son permitidas.',
    code: 'DENIED_BY_POLICY' as const
});

const DENY_ANONYMOUS: AuthorizationResult = Object.freeze({
    allowed: false,
    reason: 'Acceso denegado. Se requiere autenticación.',
    code: 'ANONYMOUS_NOT_ALLOWED' as const
});

const DENY_INVALID_IDENTITY: AuthorizationResult = Object.freeze({
    allowed: false,
    reason: 'Identidad inválida. Token expirado, malformado o revocado.',
    code: 'INVALID_CONTEXT' as const
});

/**
 * Identidad inválida por falta de empresa.
 * PASO 7: Usuario autenticado sin companyId asignado.
 */
const MISSING_COMPANY_IDENTITY: InvalidIdentity = Object.freeze({
    kind: 'invalid' as const,
    reason: 'malformed' as const
});

/**
 * Identidad inválida por empresa suspendida/eliminada.
 * PASO 8: Empresa no activa.
 */
const SUSPENDED_COMPANY_IDENTITY: InvalidIdentity = Object.freeze({
    kind: 'invalid' as const,
    reason: 'company_suspended' as const
});

/**
 * Identidad inválida por falta de rol canónico.
 * PASO 9: Usuario sin rol válido asignado.
 */
const MISSING_ROLE_IDENTITY: InvalidIdentity = Object.freeze({
    kind: 'invalid' as const,
    reason: 'missing_role' as const
});

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Extrae el token Bearer del header de autorización.
 */
function extractBearerToken(authHeader: string | undefined): string | null {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    const token = parts[1];
    if (!token || token.trim() === '') {
        return null;
    }

    return token;
}

/**
 * Extrae el rol del token decodificado.
 * 
 * PASO 9: Validación estricta de rol canónico
 * - El rol debe existir en claims
 * - El rol debe ser uno de los roles canónicos
 * - Usuarios sin rol válido serán rechazados
 * 
 * Roles canónicos (SISTEMA_CANONICO_FINAL.md §4):
 * - superadmin, admin, supervisor, guard
 * 
 * @param decodedToken - Token decodificado de Firebase
 * @returns Rol válido o null si no existe/inválido
 */
function extractRoleFromToken(decodedToken: DecodedIdToken): UserRole | null {
    const role = decodedToken['role'] as string | undefined;

    const validRoles: UserRole[] = ['superadmin', 'admin', 'supervisor', 'guard'];
    if (role && validRoles.includes(role as UserRole)) {
        return role as UserRole;
    }

    // Sin rol válido → rechazar
    return null;
}

/**
 * Extrae el companyId del token decodificado.
 * 
 * PASO 7: Validación estricta de companyId
 * - companyId debe existir y no estar vacío
 * - Usuarios sin empresa asignada serán rechazados
 * 
 * @param decodedToken - Token decodificado de Firebase
 * @returns companyId válido o null si no existe/vacío
 */
function extractCompanyIdFromToken(decodedToken: DecodedIdToken): string | null {
    const companyId = decodedToken['companyId'] as string | undefined;

    // Validar que companyId existe y no está vacío
    if (!companyId || companyId.trim() === '') {
        return null;
    }

    return companyId;
}

/**
 * Extrae el estado de empresa del token decodificado.
 * 
 * PASO 8: Validación de estado de empresa
 * - companyStatus debe ser 'active' para permitir acceso
 * - Si no existe, se asume 'active' (compatibilidad hacia atrás)
 * 
 * @param decodedToken - Token decodificado de Firebase
 * @returns Estado de la empresa
 */
function extractCompanyStatusFromToken(decodedToken: DecodedIdToken): CompanyStatus {
    const status = decodedToken['companyStatus'] as string | undefined;

    const validStatuses: CompanyStatus[] = ['active', 'suspended', 'deleted'];
    if (status && validStatuses.includes(status as CompanyStatus)) {
        return status as CompanyStatus;
    }

    // Default: active (compatibilidad con tokens sin este claim)
    return 'active';
}

// ============================================================================
// FIREBASE SECURITY KERNEL
// ============================================================================

/**
 * FirebaseSecurityKernel
 * 
 * Implementación del SecurityKernel que usa Firebase Auth para verificar tokens.
 * 
 * Características:
 * - Verificación criptográfica real de tokens
 * - Extracción de claims personalizados (role, companyId)
 * - Autorización policy-based (igual que antes)
 * 
 * @invariant authorize() NO cambia respecto a AuthenticatingSecurityKernel
 * @invariant NO accede a Firestore
 * @invariant NO persiste sesiones
 */
export class FirebaseSecurityKernel implements SecurityKernel {
    private auth: ReturnType<typeof initializeFirebaseAuth>;

    constructor() {
        // Inicializar Firebase Auth
        this.auth = initializeFirebaseAuth();
    }

    /**
     * Verifica el token con Firebase Auth y resuelve la identidad.
     * 
     * Flujo:
     * 1. Sin header → AnonymousIdentity
     * 2. Header malformado → InvalidIdentity (malformed)
     * 3. Token inválido (Firebase) → InvalidIdentity (expired|revoked|malformed)
     * 4. Token válido → AuthenticatedIdentity
     * 
     * @param context - Contexto de la solicitud con headers
     * @returns AuthContext con la identidad resuelta
     */
    async authenticate(context: RequestContext): Promise<AuthContext> {
        // 1. Extraer token del header
        const token = extractBearerToken(context.authorizationHeader);

        // Sin token → Anónimo
        if (token === null) {
            return {
                identity: ANONYMOUS_IDENTITY
            };
        }

        try {
            // 2. Verificar token con Firebase Auth (verificación criptográfica real)
            const decodedToken = await this.auth.verifyIdToken(token, true);
            // El segundo parámetro 'true' verifica si el token fue revocado

            // 3. PASO 7: Validar que existe companyId
            const companyId = extractCompanyIdFromToken(decodedToken);

            if (companyId === null) {
                // Usuario sin empresa asignada → InvalidIdentity
                return {
                    identity: MISSING_COMPANY_IDENTITY,
                    token
                };
            }

            // 4. PASO 8: Validar que la empresa está activa
            const companyStatus = extractCompanyStatusFromToken(decodedToken);

            if (companyStatus !== 'active') {
                // Empresa suspendida o eliminada → InvalidIdentity
                return {
                    identity: SUSPENDED_COMPANY_IDENTITY,
                    token
                };
            }

            // 5. PASO 9: Validar que existe rol canónico
            const role = extractRoleFromToken(decodedToken);

            if (role === null) {
                // Usuario sin rol válido → InvalidIdentity
                return {
                    identity: MISSING_ROLE_IDENTITY,
                    token
                };
            }

            // 6. Construir identidad autenticada desde token verificado
            const authenticatedIdentity: AuthenticatedIdentity = {
                kind: 'authenticated',
                uid: decodedToken.uid,
                email: decodedToken.email ?? '',
                isEmailVerified: decodedToken.email_verified ?? false,
                role: role,
                companyId: companyId,
                authTime: decodedToken.auth_time
            };

            return {
                identity: authenticatedIdentity,
                token
            };

        } catch (error: unknown) {
            // 4. Token inválido → InvalidIdentity
            const invalidIdentity: InvalidIdentity = {
                kind: 'invalid',
                reason: this.mapFirebaseErrorToReason(error)
            };

            return {
                identity: invalidIdentity,
                token
            };
        }
    }

    /**
     * Mapea errores de Firebase a razones de invalidez.
     */
    private mapFirebaseErrorToReason(error: unknown): 'expired' | 'malformed' | 'revoked' {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            if (message.includes('expired')) {
                return 'expired';
            }
            if (message.includes('revoked')) {
                return 'revoked';
            }
        }

        // Por defecto, consideramos malformado
        return 'malformed';
    }

    /**
     * Evalúa autorización basada en políticas explícitas.
     * 
     * IDÉNTICO a AuthenticatingSecurityKernel - no cambia.
     */
    async authorize(
        context: AuthContext,
        policy: AccessPolicy
    ): Promise<AuthorizationResult> {
        const identity = context.identity;

        // 1. Verificar si es política ALLOW_AUTHENTICATED
        if (isPolicyAllowAuthenticated(policy)) {
            switch (identity.kind) {
                case 'authenticated':
                    return ALLOW;

                case 'anonymous':
                    return DENY_ANONYMOUS;

                case 'invalid':
                    return DENY_INVALID_IDENTITY;
            }
        }

        // 2. Cualquier otra política -> DENY
        return DENY_UNKNOWN_POLICY;
    }

    /**
     * Lanza SecurityViolation si no está autorizado.
     */
    async assertAuthorized(
        context: AuthContext,
        policy: AccessPolicy
    ): Promise<void> {
        const result = await this.authorize(context, policy);

        if (!result.allowed) {
            throw new SecurityViolation(
                result.reason,
                result.code
            );
        }
    }
}

/**
 * Factory function para crear kernel con Firebase Auth.
 * 
 * @returns Instancia de FirebaseSecurityKernel
 */
export function createFirebaseSecurityKernel(): SecurityKernel {
    return new FirebaseSecurityKernel();
}
