/**
 * @fileoverview Canonical Module and Capability Definitions
 * @module security/modules/definitions
 * 
 * FASE 2 - PASO 10: DEFINICIÓN DE MÓDULOS Y CAPACIDADES
 * 
 * Este archivo contiene definiciones DECLARATIVAS de los módulos
 * y capacidades del sistema según la documentación canónica.
 * 
 * Fuente: SISTEMA_CANONICO_v1.8.md - Mapeo capacidades → módulos → reglas
 * 
 * IMPORTANTE:
 * - Estas son SOLO definiciones de tipos
 * - NO se asignan permisos aquí
 * - NO hay lógica de autorización
 * - Los módulos definen EXISTENCIA, no permisos
 * - Las capacidades se validan en tiempo de ejecución
 * 
 * Principio canónico:
 * > "Una acción existe solo si capacidad + módulo + estado
 * > lo permiten simultáneamente."
 */

// ============================================================================
// MÓDULOS CANÓNICOS
// ============================================================================

/**
 * Módulos del sistema definidos en SISTEMA_CANONICO_v1.8.md
 * 
 * Los módulos definen si una funcionalidad EXISTE.
 * Un módulo apagado = la funcionalidad no existe.
 */
export type SystemModule =
    | 'core'            // §8.2 Módulo Núcleo (autenticación, usuarios, empresa, turnos)
    | 'incidents'       // §8.3 Módulo Incidentes
    | 'patrols'         // §8.4 Módulo Rondines
    | 'checklists'      // §8.5 Módulo Checklists
    | 'access_control'  // §8.6 Módulo Control de Accesos
    | 'vehicle_control' // §8.7 Módulo Control Vehicular
    | 'evidence'        // §8.8 Módulo Evidencias (transversal)
    | 'checkpoints';    // §8.9 Módulo Puntos de Control y QR

/**
 * Lista ordenada de todos los módulos canónicos.
 */
export const CANONICAL_MODULES: readonly SystemModule[] = Object.freeze([
    'core',
    'incidents',
    'patrols',
    'checklists',
    'access_control',
    'vehicle_control',
    'evidence',
    'checkpoints'
]);

// ============================================================================
// CAPACIDADES POR MÓDULO
// ============================================================================

/**
 * Capacidades del Módulo Núcleo (core)
 * SISTEMA_CANONICO_v1.8.md §8.2
 */
export type CoreCapability =
    | 'shift.open'
    | 'shift.close'
    | 'shift.view.self';

/**
 * Capacidades del Módulo Incidentes
 * SISTEMA_CANONICO_v1.8.md §8.3
 */
export type IncidentCapability =
    | 'incident.create'
    | 'incident.view.self'
    | 'incident.close'
    | 'incident.attachEvidence';

/**
 * Capacidades del Módulo Rondines (Patrols)
 * SISTEMA_CANONICO_v1.8.md §8.4
 */
export type PatrolCapability =
    | 'rondin.start'
    | 'rondin.recordCheckpoint'
    | 'rondin.finish'
    | 'qr.scan';

/**
 * Capacidades del Módulo Checklists
 * SISTEMA_CANONICO_v1.8.md §8.5
 */
export type ChecklistCapability =
    | 'checklist.view.self'
    | 'checklist.submit';

/**
 * Capacidades del Módulo Control de Accesos
 * SISTEMA_CANONICO_v1.8.md §8.6
 */
export type AccessControlCapability =
    | 'access.registerEntry'
    | 'access.registerExit'
    | 'access.view.self';

/**
 * Capacidades del Módulo Control Vehicular
 * SISTEMA_CANONICO_v1.8.md §8.7
 */
export type VehicleControlCapability =
    | 'vehicle.registerEntry'
    | 'vehicle.registerExit'
    | 'vehicle.view.self';

/**
 * Capacidades del Módulo Evidencias
 * SISTEMA_CANONICO_v1.8.md §8.8
 */
export type EvidenceCapability =
    | 'evidence.attach'
    | 'evidence.view.self';

/**
 * Capacidades del Módulo Puntos de Control y QR
 * SISTEMA_CANONICO_v1.8.md §8.9
 */
export type CheckpointCapability =
    | 'checkpoint.create'
    | 'checkpoint.disable'
    | 'checkpoint.downloadQR'
    | 'qr.scan';

// ============================================================================
// CAPACIDAD UNIFICADA
// ============================================================================

/**
 * Unión de todas las capacidades canónicas del sistema.
 */
export type Capability =
    | CoreCapability
    | IncidentCapability
    | PatrolCapability
    | ChecklistCapability
    | AccessControlCapability
    | VehicleControlCapability
    | EvidenceCapability
    | CheckpointCapability;

/**
 * Lista de todas las capacidades canónicas por módulo.
 * Referencia declarativa, no usada para autorización.
 */
export const CAPABILITIES_BY_MODULE: Readonly<Record<SystemModule, readonly string[]>> = Object.freeze({
    core: Object.freeze([
        'shift.open',
        'shift.close',
        'shift.view.self'
    ]),
    incidents: Object.freeze([
        'incident.create',
        'incident.view.self',
        'incident.close',
        'incident.attachEvidence'
    ]),
    patrols: Object.freeze([
        'rondin.start',
        'rondin.recordCheckpoint',
        'rondin.finish',
        'qr.scan'
    ]),
    checklists: Object.freeze([
        'checklist.view.self',
        'checklist.submit'
    ]),
    access_control: Object.freeze([
        'access.registerEntry',
        'access.registerExit',
        'access.view.self'
    ]),
    vehicle_control: Object.freeze([
        'vehicle.registerEntry',
        'vehicle.registerExit',
        'vehicle.view.self'
    ]),
    evidence: Object.freeze([
        'evidence.attach',
        'evidence.view.self'
    ]),
    checkpoints: Object.freeze([
        'checkpoint.create',
        'checkpoint.disable',
        'checkpoint.downloadQR',
        'qr.scan'
    ])
});

// ============================================================================
// ESTRUCTURAS DE REFERENCIA
// ============================================================================

/**
 * Estructura que asocia un módulo con una capacidad específica.
 * Usada para verificaciones futuras de permisos.
 * 
 * NOTA: Esta estructura NO otorga permisos.
 * Solo declara la relación módulo ↔ capacidad.
 */
export interface ModuleCapability {
    readonly module: SystemModule;
    readonly capability: Capability;
}

/**
 * Verifica si un string es un módulo canónico válido.
 */
export function isValidModule(value: string): value is SystemModule {
    return CANONICAL_MODULES.includes(value as SystemModule);
}

/**
 * Verifica si una capacidad pertenece a un módulo específico.
 */
export function isCapabilityInModule(capability: string, module: SystemModule): boolean {
    const moduleCapabilities = CAPABILITIES_BY_MODULE[module];
    return moduleCapabilities.includes(capability);
}
