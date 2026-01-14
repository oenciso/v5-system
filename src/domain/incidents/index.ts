/**
 * @fileoverview Incidents Domain Module Public API
 * @module domain/incidents
 * 
 * FASE 3 - PASO 8
 */

// Types
export type {
    IncidentId,
    IncidentStatus,
    IncidentSeverity,
    GeoLocation,
    IncidentRecord,
    IncidentCreatePayload,
    IncidentCreateReceipt
} from './types';

export {
    INCIDENT_SEVERITY_VALUES,
    isValidSeverity
} from './types';

// Store
export type {
    IncidentStore
} from './store';

export {
    INCIDENTS_COLLECTION,
    COMPANIES_COLLECTION,
    FirestoreIncidentStore,
    createIncidentStore,
    getIncidentStore,
    resetIncidentStore
} from './store';

// Commands - incident.create
export {
    isIncidentCreateCommand,
    validateIncidentCreatePayload,
    checkIncidentCreatePreconditions,
    executeIncidentCreate,
    persistIncident,
    emitIncidentCreateAudit
} from './commands/create';

export type {
    IncidentCreateExecutionContext,
    IncidentCreateDependencies
} from './commands/create';
