/**
 * @fileoverview Security Kernel Implementations
 * @module security/kernel.impl
 * 
 * FASE 2 - PASO 4: AUTENTICACIÓN REAL (SIN AUTORIZACIÓN)
 * 
 * Esta implementación:
 * - LEE credenciales desde headers
 * - RESUELVE identidad (Anonymous, Authenticated, Invalid)
 * - SIGUE DENEGANDO TODO en autorización
 * - NO depende de Firebase
 * - NO persiste sesiones
 * 
 * Principios del Canon aplicados:
 * - "Deny by default" (SISTEMA_CANONICO_FINAL.md §14)
 * - "El cliente es hostil por diseño" (INVARIANTES_DE_PRODUCCION.md)
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
import { AccessPolicy, AuthorizationResult } from './policies/contracts';
import { SecurityViolation } from './guards/contracts';

/**
 * Identidad anónima singleton.
 */
const ANONYMOUS_IDENTITY: AnonymousIdentity = Object.freeze({
    kind: 'anonymous' as const
});

/**
 * Resultado de denegación por defecto.
 * Usado para TODAS las autorizaciones (aún no implementamos permisos).
 */
const DENY_BY_DEFAULT: AuthorizationResult = Object.freeze({
    allowed: false,
    reason: 'Autorización no implementada. Sistema en modo deny-all.',
    code: 'DENIED_BY_POLICY' as const
});

/**
 * Estructura de un token decodificado (placeholder sin Firebase).
 * En implementaciones futuras, esto vendrá de Firebase Admin SDK.
 */
interface DecodedTokenPayload {
    uid: string;
    email: string;
    email_verified: boolean;
    role: UserRole;
    companyId: string;
    auth_time: number;
    exp: number;
}

/**
 * Tabla de caracteres Base64.
 */
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decodifica una cadena Base64 URL-safe a string UTF-8.
 * Implementación pura sin dependencias externas.
 * 
 * @param base64url - Cadena en formato Base64 URL-safe
 * @returns String decodificado
 */
function base64UrlDecode(base64url: string): string {
    // Convertir base64url a base64 estándar
    let base64 = base64url
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // Agregar padding si es necesario
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }

    // Decodificar
    let result = '';
    let buffer = 0;
    let bitsCollected = 0;

    for (const char of base64) {
        if (char === '=') break;

        const index = BASE64_CHARS.indexOf(char);
        if (index === -1) continue;

        buffer = (buffer << 6) | index;
        bitsCollected += 6;

        if (bitsCollected >= 8) {
            bitsCollected -= 8;
            result += String.fromCharCode((buffer >> bitsCollected) & 0xFF);
        }
    }

    // Decodificar UTF-8
    try {
        return decodeURIComponent(
            result.split('').map((c: string) =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
    } catch {
        return result;
    }
}

/**
 * Extrae el token Bearer del header de autorización.
 * 
 * @param authHeader - Header de autorización completo
 * @returns Token sin prefijo "Bearer " o null si inválido
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
 * Decodifica un token JWT (PLACEHOLDER - sin verificación criptográfica).
 * 
 * ⚠️ IMPORTANTE: Esta función NO valida firmas.
 * En producción, esto será reemplazado por Firebase Admin SDK.
 * 
 * @param token - Token JWT
 * @returns Payload decodificado o null si malformado
 */
function decodeTokenPlaceholder(token: string): DecodedTokenPayload | null {
    try {
        // JWT tiene 3 partes: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decodificar payload (parte central)
        const payloadBase64 = parts[1];
        if (!payloadBase64) {
            return null;
        }

        // Base64 URL decode usando función pura
        const payloadJson = base64UrlDecode(payloadBase64);
        const payload = JSON.parse(payloadJson) as Record<string, unknown>;

        // Validar campos requeridos
        if (
            typeof payload['uid'] !== 'string' ||
            typeof payload['email'] !== 'string' ||
            typeof payload['role'] !== 'string' ||
            typeof payload['companyId'] !== 'string'
        ) {
            return null;
        }

        // Validar rol
        const validRoles: UserRole[] = ['superadmin', 'admin', 'supervisor', 'guard'];
        if (!validRoles.includes(payload['role'] as UserRole)) {
            return null;
        }

        return {
            uid: payload['uid'] as string,
            email: payload['email'] as string,
            email_verified: payload['email_verified'] === true,
            role: payload['role'] as UserRole,
            companyId: payload['companyId'] as string,
            auth_time: typeof payload['auth_time'] === 'number' ? payload['auth_time'] : 0,
            exp: typeof payload['exp'] === 'number' ? payload['exp'] : 0
        };
    } catch {
        return null;
    }
}

/**
 * Verifica si un token ha expirado.
 * 
 * @param exp - Timestamp de expiración (segundos desde epoch)
 * @param now - Timestamp actual (segundos desde epoch)
 * @returns true si el token ha expirado
 */
function isTokenExpired(exp: number, now: number): boolean {
    // Si exp es 0, consideramos que no tiene expiración (para testing)
    if (exp === 0) {
        return false;
    }
    return now > exp;
}

/**
 * AuthenticatingSecurityKernel
 * 
 * Implementación del SecurityKernel que:
 * - RESUELVE identidad desde headers
 * - DENIEGA TODO en autorización
 * 
 * Señales de identidad que se leen:
 * - Authorization header (Bearer token)
 * 
 * Lo que NO se valida:
 * - Firma criptográfica del token (placeholder)
 * - Existencia del usuario en base de datos
 * - Revocación de token
 * - App Check
 * 
 * @invariant authorize() SIEMPRE deniega
 * @invariant NO persiste sesiones
 * @invariant NO usa Firebase
 */
export class AuthenticatingSecurityKernel implements SecurityKernel {
    /**
     * Resuelve la identidad del solicitante.
     * 
     * Flujo:
     * 1. Sin header → AnonymousIdentity
     * 2. Header malformado → InvalidIdentity (malformed)
     * 3. Token expirado → InvalidIdentity (expired)
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

        // 2. Decodificar token (PLACEHOLDER - sin verificación criptográfica)
        const payload = decodeTokenPlaceholder(token);

        // Token malformado → Inválido
        if (payload === null) {
            const invalidIdentity: InvalidIdentity = {
                kind: 'invalid',
                reason: 'malformed'
            };
            return {
                identity: invalidIdentity,
                token // Preservar para logging/debugging
            };
        }

        // 3. Verificar expiración
        const nowSeconds = Math.floor(context.timestamp / 1000);
        if (isTokenExpired(payload.exp, nowSeconds)) {
            const expiredIdentity: InvalidIdentity = {
                kind: 'invalid',
                reason: 'expired'
            };
            return {
                identity: expiredIdentity,
                token
            };
        }

        // 4. Construir identidad autenticada
        const authenticatedIdentity: AuthenticatedIdentity = {
            kind: 'authenticated',
            uid: payload.uid,
            email: payload.email,
            isEmailVerified: payload.email_verified,
            role: payload.role,
            companyId: payload.companyId,
            authTime: payload.auth_time
        };

        return {
            identity: authenticatedIdentity,
            token // Preservar para logging/debugging
        };
    }

    /**
     * SIEMPRE deniega la autorización.
     * 
     * La autorización real se implementará en pasos futuros.
     * Por ahora, todo acceso es denegado independientemente de la identidad.
     * 
     * @param _context - Contexto de autenticación (ignorado)
     * @param _policy - Política a evaluar (ignorado)
     * @returns AuthorizationResult con allowed: false (SIEMPRE)
     */
    async authorize(
        _context: AuthContext,
        _policy: AccessPolicy
    ): Promise<AuthorizationResult> {
        // Deny by default - no evaluamos permisos aún
        return DENY_BY_DEFAULT;
    }

    /**
     * SIEMPRE lanza SecurityViolation.
     * 
     * @param context - Contexto de autenticación
     * @param policy - Política a evaluar
     * @throws SecurityViolation siempre
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
 * DenyAllSecurityKernel (legacy)
 * 
 * Implementación mínima que deniega todo sin leer identidad.
 * Mantenida para compatibilidad con Paso 3.
 */
export class DenyAllSecurityKernel implements SecurityKernel {
    async authenticate(_context: RequestContext): Promise<AuthContext> {
        return { identity: ANONYMOUS_IDENTITY };
    }

    async authorize(
        _context: AuthContext,
        _policy: AccessPolicy
    ): Promise<AuthorizationResult> {
        return DENY_BY_DEFAULT;
    }

    async assertAuthorized(
        context: AuthContext,
        policy: AccessPolicy
    ): Promise<void> {
        const result = await this.authorize(context, policy);
        if (!result.allowed) {
            throw new SecurityViolation(result.reason, result.code);
        }
    }
}

/**
 * Factory function para crear instancia del kernel.
 * 
 * @returns Instancia de AuthenticatingSecurityKernel
 */
export function createSecurityKernel(): SecurityKernel {
    return new AuthenticatingSecurityKernel();
}

/**
 * Factory function para crear kernel sin autenticación (testing).
 * 
 * @returns Instancia de DenyAllSecurityKernel
 */
export function createDenyAllKernel(): SecurityKernel {
    return new DenyAllSecurityKernel();
}
