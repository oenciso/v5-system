/**
 * @fileoverview Canonical Capability Assignments
 * @module security/modules/capabilities
 * 
 * FASE 2 - PASO 11: MAPEO ROL → CAPACIDAD (DECLARATIVO)
 * 
 * IMPORTANTE - MODELO CANÓNICO:
 * 
 * El canon establece explícitamente (§4.1, §4.4):
 * > "Los roles NO habilitan acciones operativas."
 * > "Las acciones reales se habilitan por capacidades y módulos."
 * > "El rol define hasta dónde puede delegar."
 * > "La capacidad define qué puede ejecutar."
 * 
 * Por lo tanto:
 * - NO existe un mapeo rol → capacidad fijo
 * - Las capacidades se ASIGNAN individualmente a usuarios
 * - Los perfiles son paquetes de capacidades RECOMENDADOS
 * 
 * Este archivo define:
 * 1. Perfiles operativos canónicos (§5.4)
 * 2. Capacidades por categoría (§7.3-§7.5)
 * 3. Techo de capacidades por rol (lo máximo que puede DELEGAR)
 * 
 * ⚠️ NINGÚN PERMISO SE OTORGA AUTOMÁTICAMENTE
 * Las capacidades deben estar explícitamente asignadas al usuario.
 */

import { UserRole } from '../auth/types';
import { Capability } from './definitions';

// ============================================================================
// CATEGORÍAS DE CAPACIDADES (§7.3-§7.5)
// ============================================================================

/**
 * Capacidades de operación base (§7.3)
 * Usadas por: Guardias en campo
 */
export const OPERATION_CAPABILITIES: readonly Capability[] = Object.freeze([
    // Turnos
    'shift.open',
    'shift.close',
    'shift.view.self',
    // Incidentes
    'incident.create',
    'incident.view.self',
    'incident.close',
    'incident.attachEvidence',
    // Rondines
    'rondin.start',
    'rondin.recordCheckpoint',
    'rondin.finish',
    // QR
    'qr.scan',
    // Checklists
    'checklist.view.self',
    'checklist.submit',
    // Control de accesos
    'access.registerEntry',
    'access.registerExit',
    'access.view.self',
    // Control vehicular
    'vehicle.registerEntry',
    'vehicle.registerExit',
    'vehicle.view.self',
    // Evidencias
    'evidence.attach',
    'evidence.view.self'
]);

/**
 * Capacidades administrativas (§7.4)
 * Usadas por: Administradores
 */
export const ADMIN_CAPABILITIES: readonly string[] = Object.freeze([
    'user.invite',
    'user.suspend',
    'user.assignCapabilities',
    'user.assignProfile',
    'module.enable',
    'module.disable',
    'checkpoint.create',
    'checkpoint.disable',
    'checkpoint.downloadQR'
]);

/**
 * Capacidades de supervisión (§7.5)
 * Usadas por: Supervisores
 */
export const SUPERVISION_CAPABILITIES: readonly string[] = Object.freeze([
    'operation.view.assigned',
    'incident.close.supervised',
    'shift.close.supervised'
]);

// ============================================================================
// PERFILES OPERATIVOS (§5.4)
// ============================================================================

/**
 * Perfil operativo canónico.
 * Un perfil es un paquete de capacidades RECOMENDADO.
 * NO es una entidad de seguridad dura.
 */
export interface OperativeProfile {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly typicalCapabilities: readonly Capability[];
}

/**
 * Perfil Rondinero (§5.4.1)
 * Enfocado en recorridos físicos y validación por puntos de control.
 */
export const PROFILE_RONDINERO: OperativeProfile = Object.freeze({
    id: 'rondinero',
    name: 'Rondinero',
    description: 'Recorridos físicos y validación por puntos de control',
    typicalCapabilities: Object.freeze([
        'shift.open',
        'shift.close',
        'rondin.start',
        'rondin.recordCheckpoint',
        'rondin.finish',
        'qr.scan',
        'incident.create',
        'evidence.attach'
    ] as const)
});

/**
 * Perfil Guardia de Accesos (§5.4.2)
 * Enfocado en control de entradas y salidas.
 */
export const PROFILE_GUARDIA_ACCESOS: OperativeProfile = Object.freeze({
    id: 'guardia_accesos',
    name: 'Guardia de Accesos',
    description: 'Control de entradas y salidas',
    typicalCapabilities: Object.freeze([
        'shift.open',
        'shift.close',
        'access.registerEntry',
        'access.registerExit',
        'vehicle.registerEntry',
        'vehicle.registerExit',
        'qr.scan',
        'evidence.attach'
    ] as const)
});

/**
 * Perfil Guardia General (§5.4.3)
 * Perfil operativo generalista.
 */
export const PROFILE_GUARDIA_GENERAL: OperativeProfile = Object.freeze({
    id: 'guardia_general',
    name: 'Guardia General',
    description: 'Operativo generalista',
    typicalCapabilities: Object.freeze([
        'shift.open',
        'shift.close',
        'checklist.submit',
        'incident.create',
        'qr.scan',
        'evidence.attach'
    ] as const)
});

/**
 * Lista de todos los perfiles operativos canónicos.
 */
export const CANONICAL_PROFILES: readonly OperativeProfile[] = Object.freeze([
    PROFILE_RONDINERO,
    PROFILE_GUARDIA_ACCESOS,
    PROFILE_GUARDIA_GENERAL
]);

// ============================================================================
// TECHO DE DELEGACIÓN POR ROL (§4.3)
// ============================================================================

/**
 * Techo de delegación por rol.
 * 
 * El canon establece que un rol define "hasta dónde puede delegar",
 * no qué puede ejecutar directamente.
 * 
 * Las capacidades listadas son el MÁXIMO que este rol puede ASIGNAR
 * a usuarios de roles inferiores.
 * 
 * ⚠️ ESTO NO OTORGA PERMISOS AUTOMÁTICOS
 */
export interface RoleDelegationCeiling {
    readonly role: UserRole;
    readonly level: number;
    readonly canDelegateCapabilities: readonly string[];
    readonly canDelegateToRoles: readonly UserRole[];
    readonly canManageModules: boolean;
}

/**
 * Techo de delegación: Superadmin (nivel 100)
 * - Puede delegar todas las capacidades
 * - Puede asignar cualquier rol inferior
 * - Puede gestionar módulos
 */
export const CEILING_SUPERADMIN: RoleDelegationCeiling = Object.freeze({
    role: 'superadmin' as const,
    level: 100,
    canDelegateCapabilities: Object.freeze([
        ...OPERATION_CAPABILITIES,
        ...ADMIN_CAPABILITIES,
        ...SUPERVISION_CAPABILITIES
    ]),
    canDelegateToRoles: Object.freeze(['admin', 'supervisor', 'guard'] as const),
    canManageModules: true
});

/**
 * Techo de delegación: Administrador (nivel 80)
 * - Puede delegar capacidades operativas y de supervisión
 * - Puede asignar roles inferiores (supervisor, guard)
 * - Puede activar/desactivar módulos YA habilitados
 */
export const CEILING_ADMIN: RoleDelegationCeiling = Object.freeze({
    role: 'admin' as const,
    level: 80,
    canDelegateCapabilities: Object.freeze([
        ...OPERATION_CAPABILITIES,
        ...SUPERVISION_CAPABILITIES,
        // Admin también puede delegar capacidades admin (dentro de su techo)
        'user.invite',
        'user.suspend',
        'user.assignCapabilities',
        'user.assignProfile',
        'checkpoint.create',
        'checkpoint.disable',
        'checkpoint.downloadQR'
    ]),
    canDelegateToRoles: Object.freeze(['supervisor', 'guard'] as const),
    canManageModules: true // Solo módulos ya habilitados
});

/**
 * Techo de delegación: Supervisor (nivel 70)
 * - Puede ver información asignada
 * - NO puede delegar roles
 * - NO puede gestionar módulos
 */
export const CEILING_SUPERVISOR: RoleDelegationCeiling = Object.freeze({
    role: 'supervisor' as const,
    level: 70,
    canDelegateCapabilities: Object.freeze([]), // No delega
    canDelegateToRoles: Object.freeze([] as const),
    canManageModules: false
});

/**
 * Techo de delegación: Guardia (nivel 50)
 * - Solo ejecuta operación
 * - NO puede delegar nada
 * - NO puede gestionar módulos
 */
export const CEILING_GUARD: RoleDelegationCeiling = Object.freeze({
    role: 'guard' as const,
    level: 50,
    canDelegateCapabilities: Object.freeze([]),
    canDelegateToRoles: Object.freeze([] as const),
    canManageModules: false
});

/**
 * Mapeo de roles a techos de delegación.
 */
export const DELEGATION_CEILINGS: Readonly<Record<UserRole, RoleDelegationCeiling>> = Object.freeze({
    superadmin: CEILING_SUPERADMIN,
    admin: CEILING_ADMIN,
    supervisor: CEILING_SUPERVISOR,
    guard: CEILING_GUARD
});

// ============================================================================
// FUNCIONES DE CONSULTA (SOLO LECTURA)
// ============================================================================

/**
 * Obtiene el techo de delegación para un rol.
 */
export function getDelegationCeiling(role: UserRole): RoleDelegationCeiling {
    return DELEGATION_CEILINGS[role];
}

/**
 * Verifica si un rol puede delegar a otro rol.
 */
export function canRoleDelegateTo(fromRole: UserRole, toRole: UserRole): boolean {
    const ceiling = DELEGATION_CEILINGS[fromRole];
    return ceiling.canDelegateToRoles.includes(toRole);
}

/**
 * Verifica si un rol puede delegar una capacidad específica.
 * 
 * NOTA: Esto NO verifica si el usuario TIENE la capacidad,
 * solo si su rol PERMITE delegarla.
 */
export function canRoleDelegateCapability(role: UserRole, capability: string): boolean {
    const ceiling = DELEGATION_CEILINGS[role];
    return ceiling.canDelegateCapabilities.includes(capability);
}

/**
 * Obtiene el nivel jerárquico de un rol.
 */
export function getRoleLevel(role: UserRole): number {
    return DELEGATION_CEILINGS[role].level;
}

/**
 * Verifica si un rol es superior a otro.
 */
export function isRoleSuperior(roleA: UserRole, roleB: UserRole): boolean {
    return getRoleLevel(roleA) > getRoleLevel(roleB);
}
