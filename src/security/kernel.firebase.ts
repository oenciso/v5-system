/**
 * @fileoverview Firebase-backed Security Kernel Implementation
 * @module security/kernel.firebase
 * 
 * FASE 2 - PASO 6: INTEGRACIÓN CON FIREBASE AUTH
 * 
 * Esta implementación:
 * - VERIFICA tokens reales con Firebase Auth
 * - RESUELVE identidad confiable (criptográficamente verificada)
 * - MANTIENE la autorización exactamente igual
 * - NO accede a Firestore
 * - NO persiste sesiones
 * 
 * Qué valida Firebase:
 * - Firma criptográfica del token
 * - Expiración del token
 * - Emisor del token (proyecto correcto)
 * 
 * Qué NO valida aún:
 * - Empresa del usuario
 * - Roles específicos
 * - Módulos habilitados
 * - Datos en Firestore
 * 
 * Principios del Canon aplicados:
 * - "Deny by default"
 * - "El cliente es hostil por diseño"
 * - "Backend como autoridad única"
 */

import { SecurityKernel } from './kernel';
import {
    RequestContext,
    AuthContext,
    AnonymousIdentity,
    AuthenticatedIdentity,
    InvalidIdentity,
    UserRole
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
 * Los custom claims de Firebase pueden contener el rol.
 */
function extractRoleFromToken(decodedToken: DecodedIdToken): UserRole {
    const role = decodedToken['role'] as string | undefined;

    const validRoles: UserRole[] = ['superadmin', 'admin', 'supervisor', 'guard'];
    if (role && validRoles.includes(role as UserRole)) {
        return role as UserRole;
    }

    // Default: guard (rol mínimo) si no hay rol en claims
    return 'guard';
}

/**
 * Extrae el companyId del token decodificado.
 */
function extractCompanyIdFromToken(decodedToken: DecodedIdToken): string {
    const companyId = decodedToken['companyId'] as string | undefined;
    return companyId ?? '';
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

            // 3. Construir identidad autenticada desde token verificado
            const authenticatedIdentity: AuthenticatedIdentity = {
                kind: 'authenticated',
                uid: decodedToken.uid,
                email: decodedToken.email ?? '',
                isEmailVerified: decodedToken.email_verified ?? false,
                role: extractRoleFromToken(decodedToken),
                companyId: extractCompanyIdFromToken(decodedToken),
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
