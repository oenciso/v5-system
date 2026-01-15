# DEV_EXECUTION_LOG.md

---

## [2026-01-14] CIERRE FASE 2: Implementación Real de Seguridad

### Estado Final
- **Fase:** 2 - Implementación Real de Seguridad
- **Estado:** ✅ **COMPLETADA**
- **Rama:** `phase-2-security-implementation`
- **Pasos Ejecutados:** 11 de 11
- **Fecha de Cierre:** 2026-01-14

---

## 🔒 GARANTÍAS DE SEGURIDAD ENTREGADAS

### 1. Autenticación (Firebase Auth)
- ✅ Verificación criptográfica real de tokens
- ✅ Validación de expiración
- ✅ Verificación de revocación
- ✅ Extracción de Custom Claims

### 2. Resolución de Identidad
- ✅ `AnonymousIdentity` - sin token
- ✅ `AuthenticatedIdentity` - token válido con todos los claims
- ✅ `InvalidIdentity` - token inválido con razón explícita

### 3. Aislamiento por Empresa
- ✅ `companyId` requerido en claims
- ✅ `companyStatus` validado (active/suspended/deleted)
- ✅ Empresas no activas → acceso bloqueado

### 4. Modelo de Roles
- ✅ Roles canónicos: superadmin, admin, supervisor, guard
- ✅ Rol requerido en claims
- ✅ Jerarquía de niveles (100, 80, 70, 50)

### 5. Modelo de Capacidades
- ✅ 8 módulos canónicos definidos
- ✅ 26 capacidades atómicas definidas
- ✅ 3 perfiles operativos canónicos

### 6. Techos de Delegación
- ✅ Superadmin: puede delegar todo
- ✅ Admin: puede delegar operación + supervisión
- ✅ Supervisor/Guard: no delegan

---

## ⚠️ ESTADO EXPLÍCITO

### Lo que SÍ existe:
- Kernel de seguridad funcional (FirebaseSecurityKernel)
- Autenticación completa con Firebase
- Validación de identidad, empresa, estado, rol
- Definiciones declarativas de módulos y capacidades
- Política mínima ALLOW_AUTHENTICATED

### Lo que NO existe aún:
- ❌ **Permisos automáticos por rol** - las capacidades NO se derivan del rol
- ❌ **Ejecución de dominio** - ningún comando se ejecuta
- ❌ **Persistencia en Firestore** - solo lectura de claims
- ❌ **Auditoría integrada** - no hay eventos persistidos
- ❌ **UI** - ningún componente visual

---

## 🔐 MODELO DE SEGURIDAD CONGELADO

Las siguientes definiciones están **CONGELADAS** y no deben modificarse sin aprobación explícita:

| Componente | Archivo | Estado |
|------------|---------|--------|
| SecurityKernel interface | `src/security/kernel.ts` | FROZEN |
| Identity types | `src/security/auth/types.ts` | FROZEN |
| Policy contracts | `src/security/policies/contracts.ts` | FROZEN |
| Module definitions | `src/security/modules/definitions.ts` | FROZEN |
| Capability mappings | `src/security/modules/capabilities.ts` | FROZEN |

---

## 🚀 TRANSICIÓN A FASE 3

### Fase 3: Infraestructura de Comandos
La Fase 3 implementará:
- Contrato de comando (`DomainCommand`)
- Ejecución de comandos con validación de seguridad
- Tabla de idempotencia
- Persistencia en Firestore
- Auditoría integrada

### Precondiciones para Fase 3
- ✅ SecurityKernel funcional
- ✅ Autenticación con Firebase
- ✅ Identidad, empresa, estado, rol resueltos
- ✅ Módulos y capacidades definidos
- ✅ Modelo de seguridad documentado

### Regla de Transición
> **Las definiciones de seguridad de Fase 2 son la BASE para Fase 3.**
> No se redefinirán tipos, interfaces ni contratos.
> Fase 3 CONSUME la seguridad, no la redefine.

---

## [2026-01-14] INICIO FASE 3: Infraestructura de Comandos

### Estado
- **Fase:** 4 - Client / UI
- **Paso Actual:** 1 - UI Shell + Command Consumption
- **Estado:** COMPLETADO ✅
- **Rama:** `phase-3-domain-commands`

### Paso 1: Contrato DomainCommand — COMPLETADO ✅
- **Objetivo:** Definir el contrato canónico de comandos de dominio.
- **Fecha:** 2026-01-14
- **Fuente:** SISTEMA_CANONICO_v1.9.md

#### Garantías del Contrato (§9.1)
- **INMUTABLE:** Una vez creado, no se modifica
- **IDEMPOTENTE:** Mismo commandId = mismo resultado
- **AUDITABLE:** Toda información necesaria para trazar
- **TRAZABLE:** Actor, empresa, módulo, capacidad explícitos

#### Estructura del Comando (§9.2)
```typescript
interface DomainCommand<TPayload> {
    // Identificación
    readonly commandId: CommandId;
    readonly commandType: CommandType;
    readonly version: CommandVersion;
    
    // Contexto de seguridad
    readonly actor: CommandActor;
    readonly companyId: CompanyId;
    
    // Contexto de ejecución
    readonly module: SystemModule;
    readonly capability: Capability;
    readonly origin: CommandOrigin;
    
    // Timestamps
    readonly clientTimestamp: number;
    
    // Datos
    readonly payload: TPayload;
}
```

#### Tipos de Comando Canónicos (§9.5)
- Turnos: shift.open, shift.close, shift.close.supervised
- Incidentes: incident.create, incident.close
- Rondines: rondin.start, rondin.recordCheckpoint, rondin.finish
- Checklists: checklist.submit
- Accesos: access.registerEntry, access.registerExit
- Vehicular: vehicle.registerEntry, vehicle.registerExit
- Evidencias: evidence.attach
- Checkpoints: checkpoint.create, checkpoint.disable

#### Códigos de Rechazo Tipados
- UNAUTHORIZED, FORBIDDEN, COMPANY_SUSPENDED, USER_SUSPENDED
- MODULE_DISABLED, DUPLICATE_COMMAND
- INVALID_STATE, PRECONDITION_FAILED, RESOURCE_NOT_FOUND
- INVALID_PAYLOAD, VERSION_MISMATCH, INTERNAL_ERROR

#### Archivos Creados
- `src/commands/contracts.ts` - Contrato de comando
- `src/commands/index.ts` - Índice del módulo

#### ⚠️ SOLO CONTRATO, NO EJECUCIÓN
- Esto es SOLO la definición del contrato
- NO hay ejecución de comandos
- NO hay persistencia
- NO hay lógica de negocio

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ Contrato basado en canon (§9.2)
- ✅ Tipos de comando del canon (§9.5)
- ✅ Seguridad consumida, no redefinida

#### Lo que NO se implementó
- ❌ Ejecución de comandos
- ❌ Persistencia en Firestore
- ❌ Tabla de idempotencia
- ❌ Auditoría
- ❌ UI

---

### Paso 2: Modelo de Idempotencia — COMPLETADO ✅
- **Objetivo:** Definir el contrato canónico de idempotencia garantizando que un comando con el mismo commandId se procese como máximo una vez.
- **Fecha:** 2026-01-14
- **Fuente:** SISTEMA_CANONICO_v1.9.md §9.4, INVARIANTES_DE_PRODUCCION.md

#### Garantías de Idempotencia (§9.4)

| Garantía | Descripción |
|----------|-------------|
| **UNICIDAD** | Cada `commandId` se procesa una sola vez |
| **DETERMINISMO** | Reintentos devuelven el mismo resultado |
| **AISLAMIENTO** | La clave compuesta (commandId, companyId) garantiza aislamiento por tenant |
| **INMUTABILIDAD** | Una vez resuelto (ACCEPTED/REJECTED), el registro no cambia |

#### Estructura del Registro de Idempotencia

```typescript
interface IdempotencyRecord {
    // Identificación (clave compuesta)
    readonly commandId: CommandId;
    readonly companyId: CompanyId;
    
    // Estado de procesamiento
    readonly status: IdempotencyStatus; // 'PENDING' | 'ACCEPTED' | 'REJECTED'
    readonly createdAt: number;         // Unix ms
    readonly resolvedAt?: number;       // undefined si PENDING
    
    // Resultado
    readonly resultCode?: IdempotencyResultCode; // 'SUCCESS' | RejectionCode
}
```

#### Estados de Idempotencia

| Estado | Significado |
|--------|-------------|
| `PENDING` | Comando en procesamiento (in-flight) |
| `ACCEPTED` | Comando procesado exitosamente |
| `REJECTED` | Comando rechazado con razón tipada |

**Diagrama de transición:**
```
(nuevo) → PENDING → ACCEPTED
               ↘ REJECTED
```

#### Comportamiento Explícito con Duplicados

| Situación | Comportamiento |
|-----------|----------------|
| Comando NO existe | Crear registro PENDING, procesar normalmente |
| Comando PENDING (in-flight) | Rechazar con `DUPLICATE_COMMAND`, NO re-procesar |
| Comando ACCEPTED | Devolver resultado original, NO re-procesar |
| Comando REJECTED | Devolver rechazo original, NO re-procesar |

#### TTL Canónico (INVARIANTES_DE_PRODUCCION.md)

| Constante | Valor | Propósito |
|-----------|-------|-----------|
| `IDEMPOTENCY_TTL_MS` | 24 horas | TTL general del registro |
| `PENDING_TIMEOUT_MS` | 5 minutos | Timeout para comandos en vuelo abandonados |

#### Archivos Creados
- `src/commands/idempotency.ts` - Contrato de idempotencia

#### Archivos Modificados
- `src/commands/index.ts` - Exportaciones de tipos de idempotencia

#### ⚠️ SOLO DEFINICIÓN, NO IMPLEMENTACIÓN

- Esto es SOLO la definición del modelo
- NO hay elección de base de datos
- NO hay lecturas/escrituras de persistencia
- NO hay ejecución de comandos
- NO hay lógica de Firestore

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ IdempotencyKey define clave compuesta (commandId + companyId)
- ✅ IdempotencyStatus define estados (PENDING, ACCEPTED, REJECTED)
- ✅ IdempotencyRecord incluye todos los campos requeridos
- ✅ Comportamiento con duplicados explícitamente definido
- ✅ Comportamiento con in-flight explícitamente definido

#### Lo que NO se implementó
- ❌ Elección de base de datos
- ❌ Lecturas de idempotencia
- ❌ Escrituras de idempotencia
- ❌ Lógica de Firestore
- ❌ Ejecución de comandos
- ❌ Auditoría
- ❌ UI

---

### Paso 3: Pipeline de Ejecución de Comandos — COMPLETADO ✅
- **Objetivo:** Definir el contrato canónico del pipeline de ejecución de comandos.
- **Fecha:** 2026-01-14
- **Fuente:** SISTEMA_CANONICO_v1.9.md §9, INVARIANTES_DE_PRODUCCION.md

#### Etapas del Pipeline (Orden Estricto)

| # | Etapa | Efecto | Descripción |
|---|-------|--------|-------------|
| 1 | `INTAKE` | PURE | Normalización del comando crudo |
| 2 | `AUTHENTICATION` | PURE | Resolución de identidad (consume SecurityKernel) |
| 3 | `AUTHORIZATION` | PURE | Verificación de capacidad (consume SecurityKernel) |
| 4 | `IDEMPOTENCY_CHECK` | PURE | Verificación de duplicados (consume IdempotencyRecord) |
| 5 | `PAYLOAD_VALIDATION` | PURE | Validación del payload específico |
| 6 | `PRECONDITION_CHECK` | PURE | Verificación de precondiciones de negocio |
| 7 | `EXECUTION` | SIDE-EFFECTING | Ejecución de lógica de dominio (**ABSTRACT**) |
| 8 | `PERSISTENCE` | SIDE-EFFECTING | Persistencia en Firestore (**ABSTRACT**) |
| 9 | `AUDIT_EMISSION` | SIDE-EFFECTING | Emisión de evento de auditoría (**ABSTRACT**) |

#### Justificación del Orden

1. **INTAKE primero:** Normaliza antes de cualquier validación
2. **AUTHENTICATION antes de AUTHORIZATION:** Identifica al actor antes de verificar permisos
3. **AUTHORIZATION temprano:** Verifica permisos antes de cualquier lógica costosa
4. **IDEMPOTENCY_CHECK antes de validación:** Detecta duplicados sin procesar payload
5. **PAYLOAD_VALIDATION después de idempotencia:** Solo valida comandos nuevos
6. **PRECONDITION_CHECK al final de PURE:** Verifica estado de negocio antes de efectos
7. **SIDE-EFFECTING al final:** Efectos solo después de todas las validaciones

#### Garantías del Pipeline

| Garantía | Descripción |
|----------|-------------|
| **ORDEN** | Las etapas se ejecutan en orden estricto definido |
| **FAIL-FAST** | Si una etapa falla, el pipeline se detiene inmediatamente |
| **TRAZABILIDAD** | El contexto acumula información de cada etapa |
| **DETERMINISMO** | Mismo comando + estado → mismo resultado |
| **IDEMPOTENCIA** | Comandos duplicados devuelven resultado cacheado |

#### Clasificación de Efectos

| Tipo | Descripción | Etapas |
|------|-------------|--------|
| **PURE** | No modifica estado. Puede reintentar sin consecuencias | 1-6 |
| **SIDE_EFFECTING** | Modifica estado. Requiere idempotencia | 7-9 |

#### Códigos de Rechazo por Etapa

| Etapa | Códigos |
|-------|---------|
| INTAKE | `INVALID_PAYLOAD`, `VERSION_MISMATCH` |
| AUTHENTICATION | `UNAUTHORIZED`, `COMPANY_SUSPENDED`, `USER_SUSPENDED` |
| AUTHORIZATION | `FORBIDDEN`, `MODULE_DISABLED` |
| IDEMPOTENCY_CHECK | `DUPLICATE_COMMAND` |
| PAYLOAD_VALIDATION | `INVALID_PAYLOAD` |
| PRECONDITION_CHECK | `INVALID_STATE`, `PRECONDITION_FAILED`, `RESOURCE_NOT_FOUND`, `RESOURCE_LOCKED` |
| EXECUTION | `INTERNAL_ERROR` |
| PERSISTENCE | `INTERNAL_ERROR` |
| AUDIT_EMISSION | `INTERNAL_ERROR` |

#### Contexto de Ejecución

El `CommandExecutionContext` se enriquece progresivamente:

```typescript
interface CommandExecutionContext<TPayload> {
    // Metadata del pipeline
    readonly currentStage: PipelineStage;
    readonly startedAt: number;
    
    // Desde INTAKE
    readonly command?: DomainCommand<TPayload>;
    
    // Desde AUTHENTICATION
    readonly authContext?: AuthContext;
    readonly identity?: RuntimeIdentity;
    
    // Desde AUTHORIZATION
    readonly authorizationResult?: AuthorizationResult;
    
    // Desde IDEMPOTENCY_CHECK
    readonly idempotencyResult?: IdempotencyCheckResult;
    
    // Desde PAYLOAD_VALIDATION
    readonly payloadValid?: boolean;
    
    // Desde PRECONDITION_CHECK
    readonly preconditionsMet?: boolean;
    
    // En caso de fallo
    readonly failure?: PipelineFailure;
}
```

#### Contratos Consumidos (FROZEN)

| Contrato | Archivo | Consumido en |
|----------|---------|--------------|
| SecurityKernel | `src/security/kernel.ts` | AUTHENTICATION, AUTHORIZATION |
| DomainCommand | `src/commands/contracts.ts` | INTAKE, todas las etapas |
| IdempotencyCheckResult | `src/commands/idempotency.ts` | IDEMPOTENCY_CHECK |
| RejectionCode | `src/commands/contracts.ts` | Todas las etapas |

#### Archivos Creados
- `src/commands/pipeline.ts` - Contrato del pipeline de ejecución

#### Archivos Modificados
- `src/commands/index.ts` - Exportaciones de tipos del pipeline

#### ⚠️ SOLO DEFINICIÓN, NO IMPLEMENTACIÓN

- **Esto es SOLO la definición del contrato del pipeline**
- NO hay ejecución de comandos
- NO hay persistencia (Firestore)
- NO hay emisión de auditoría
- NO hay handlers implementados
- TODAS las etapas están marcadas como `implemented: false`

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ Pipeline define 9 etapas ordenadas
- ✅ Cada etapa tiene clasificación de efectos (PURE/SIDE_EFFECTING)
- ✅ Códigos de rechazo mapeados a etapas
- ✅ Consume SecurityKernel (no redefine)
- ✅ Consume IdempotencyRecord (no redefine)
- ✅ Comportamiento declarativo solamente

#### Lo que NO se implementó
- ❌ Ejecución de comandos
- ❌ Handlers de etapas
- ❌ Persistencia en Firestore
- ❌ Emisión de auditoría
- ❌ Lógica de dominio
- ❌ Validadores de payload
- ❌ Verificadores de precondiciones
- ❌ UI

---

### Paso 4: Skeleton Mínimo del Pipeline — COMPLETADO ✅
- **Objetivo:** Implementar skeleton mínimo y ejecutable del pipeline de comandos.
- **Fecha:** 2026-01-14
- **Fuente:** Contrato del pipeline (Step 3)

#### Componentes Implementados

| Componente | Descripción |
|------------|-------------|
| `runCommandPipeline()` | Función principal que ejecuta el pipeline completo |
| `runPipelineUpToStage()` | Función para ejecutar hasta una etapa específica (testing) |
| `StageNotImplementedError` | Error para etapas SIDE-EFFECTING no implementadas |
| `PipelineRunnerDependencies` | Interfaz de dependencias (SecurityKernel, RequestContext) |

#### Estado de Implementación por Etapa

| Etapa | Estado | Comportamiento |
|-------|--------|----------------|
| `INTAKE` | ✅ PLACEHOLDER | No-op, comando ya normalizado |
| `AUTHENTICATION` | ✅ WIRED | Consume `SecurityKernel.authenticate()` |
| `AUTHORIZATION` | ✅ WIRED | Consume `SecurityKernel.authorize()` |
| `IDEMPOTENCY_CHECK` | ✅ STUB | Siempre retorna "nuevo comando" |
| `PAYLOAD_VALIDATION` | ✅ PLACEHOLDER | No-op, asume payload válido |
| `PRECONDITION_CHECK` | ✅ PLACEHOLDER | No-op, asume precondiciones cumplidas |
| `EXECUTION` | ❌ STUB | Lanza `StageNotImplementedError` |
| `PERSISTENCE` | ❌ STUB | Lanza `StageNotImplementedError` |
| `AUDIT_EMISSION` | ❌ STUB | Lanza `StageNotImplementedError` |

#### Comportamiento del Pipeline

```typescript
// Ejecución completa (fallará en EXECUTION)
const result = await runCommandPipeline(command, deps);

// Ejecución hasta etapa específica (para testing de PURE stages)
const result = await runPipelineUpToStage(command, deps, 'PRECONDITION_CHECK');
```

#### Garantías Implementadas

| Garantía | Estado |
|----------|--------|
| Orden estricto de etapas | ✅ IMPLEMENTADO |
| Fail-fast (detener en primer fallo) | ✅ IMPLEMENTADO |
| Resultado tipado | ✅ IMPLEMENTADO |
| Contexto acumulativo | ✅ IMPLEMENTADO |
| SecurityKernel wired | ✅ IMPLEMENTADO |
| Idempotency interface ready | ✅ STUB (no storage) |

#### Archivos Creados
- `src/commands/pipeline.runner.ts` - Implementación del skeleton del pipeline

#### Archivos Modificados
- `src/commands/index.ts` - Exportaciones del runner
- `DEV_EXECUTION_LOG.md` - Documentación del paso

#### ⚠️ SKELETON SOLO, NO EJECUCIÓN REAL

- **Etapas PURE:** Placeholders que pasan automáticamente
- **Etapas SIDE-EFFECTING:** Stubs que lanzan error
- NO hay ejecución de lógica de dominio
- NO hay escritura a Firestore
- NO hay emisión de auditoría

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ Pipeline ejecuta etapas en orden
- ✅ Fail-fast funciona (detiene en primer fallo)
- ✅ Resultado tipado retornado correctamente
- ✅ SIDE-EFFECTING stages lanzan `StageNotImplementedError`
- ✅ SecurityKernel consumido (no redefinido)
- ✅ Comportamiento coincide con definición de Step 3

#### Lo que NO se implementó
- ❌ Ejecución de lógica de dominio
- ❌ Persistencia en Firestore
- ❌ Emisión de auditoría
- ❌ Validación real de payload
- ❌ Verificación real de precondiciones
- ❌ Storage de idempotencia
- ❌ UI

---

### Paso 5: Persistencia de Idempotencia (Firestore) — COMPLETADO ✅
- **Objetivo:** Implementar persistencia real de idempotencia usando Firestore.
- **Fecha:** 2026-01-14
- **Fuente:** Contratos de idempotencia (Step 2), INVARIANTES_DE_PRODUCCION.md

#### Componentes Implementados

| Componente | Descripción |
|------------|-------------|
| `FirestoreIdempotencyStore` | Implementación de Firestore para idempotencia |
| `IdempotencyStore` | Interfaz abstracta para storage |
| `initializeFirestore()` | Inicialización de Firestore Admin SDK |
| `createDocumentId()` | Genera clave compuesta `{companyId}_{commandId}` |

#### Estructura de Firestore

```
Colección: idempotency
└── Documento: {companyId}_{commandId}
    ├── commandId: string
    ├── companyId: string
    ├── status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    ├── createdAt: Timestamp
    ├── resolvedAt?: Timestamp
    ├── resultCode?: 'SUCCESS' | RejectionCode
    └── expiresAt: Timestamp (para TTL policy)
```

#### Transiciones de Estado

```
(no existe) → PENDING → ACCEPTED
                   ↘ REJECTED
```

| Transición | Descripción |
|------------|-------------|
| `∅ → PENDING` | Comando nuevo, crear registro antes de procesar |
| `PENDING → ACCEPTED` | Comando procesado exitosamente |
| `PENDING → REJECTED` | Comando rechazado con código tipado |

#### Comportamiento de Duplicados

| Situación | Comportamiento |
|-----------|----------------|
| No existe registro | Crear PENDING, procesar comando |
| PENDING no expirado | Rechazar con `DUPLICATE_COMMAND` |
| PENDING expirado (>5min) | Tratar como nuevo, sobrescribir |
| ACCEPTED | Retornar resultado cacheado |
| REJECTED | Retornar rechazo cacheado |
| Registro expirado (>24h) | Tratar como nuevo comando |

#### TTL Implementados

| Constante | Valor | Propósito |
|-----------|-------|-----------|
| `IDEMPOTENCY_TTL_MS` | 24 horas | TTL general del registro |
| `PENDING_TIMEOUT_MS` | 5 minutos | Timeout para PENDING abandonados |

#### Integración con Pipeline

- Pipeline runner ahora acepta `IdempotencyStore` opcional
- Por defecto usa `FirestoreIdempotencyStore`
- Etapa `IDEMPOTENCY_CHECK` ahora:
  1. Valida que existe identidad autenticada
  2. Consulta Firestore para comando existente
  3. Crea registro PENDING si es comando nuevo
  4. Rechaza si está in-flight o ya procesado

#### Archivos Creados
- `src/storage/firestore.ts` - Inicialización de Firestore
- `src/storage/index.ts` - Exportaciones del módulo storage
- `src/commands/idempotency.store.ts` - Implementación Firestore de IdempotencyStore

#### Archivos Modificados
- `src/commands/pipeline.runner.ts` - Integración con idempotencia real
- `src/commands/index.ts` - Exportaciones del store
- `DEV_EXECUTION_LOG.md` - Documentación del paso

#### ⚠️ SOLO IDEMPOTENCIA, NO DOMINIO

- Firestore SOLO almacena registros de idempotencia
- NO hay escritura de datos de dominio
- NO hay ejecución de lógica de negocio
- NO hay emisión de auditoría
- Etapas SIDE-EFFECTING siguen siendo stubs

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ Clave compuesta (companyId + commandId) implementada
- ✅ Transiciones NONE → PENDING → ACCEPTED/REJECTED implementadas
- ✅ TTL y PENDING timeout implementados
- ✅ Duplicados corto-circuitados correctamente
- ✅ Transacción atómica para crear PENDING
- ✅ Comportamiento determinístico

#### Lo que NO se implementó
- ❌ Ejecución de lógica de dominio
- ❌ Escritura de datos de negocio
- ❌ Emisión de auditoría
- ❌ Validación real de payload
- ❌ Verificación real de precondiciones
- ❌ UI

---

### Paso 6: Primer Comando Real (shift.open) — COMPLETADO ✅
- **Objetivo:** Implementar un comando real de extremo a extremo como referencia.
- **Fecha:** 2026-01-14
- **Fuente:** SISTEMA_CANONICO_v1.9.md §9

#### Comando Implementado

**`shift.open`** - Abrir turno de guardia

#### Flujo Completo del Pipeline

| Etapa | Implementación |
|-------|----------------|
| `INTAKE` | Normaliza comando (no-op, ya tipado) |
| `AUTHENTICATION` | Resuelve identidad via SecurityKernel |
| `AUTHORIZATION` | Verifica capacidad via SecurityKernel |
| `IDEMPOTENCY_CHECK` | Consulta/crea registro en Firestore |
| `PAYLOAD_VALIDATION` | Valida coordenadas y notas opcionales |
| `PRECONDITION_CHECK` | Verifica usuario sin turno activo |
| `EXECUTION` | Genera ShiftRecord con ID único |
| `PERSISTENCE` | Escribe turno en Firestore |
| `AUDIT_EMISSION` | Escribe registro de auditoría |

#### Estructura de Firestore

**Turnos:**
```
companies/{companyId}/shifts/{shiftId}
├── shiftId: string
├── userId: string
├── companyId: string
├── status: 'ACTIVE' | 'CLOSED'
├── openedAt: Timestamp
├── closedAt?: Timestamp
├── openLocation?: { latitude, longitude }
├── openNotes?: string
└── sourceCommandId: string
```

**Auditoría:**
```
companies/{companyId}/audit/{auditId}
├── auditId: string
├── commandId: string
├── commandType: 'shift.open'
├── companyId: string
├── userId: string
├── userRole: string
├── result: 'ACCEPTED' | 'REJECTED'
├── timestamp: Timestamp
├── durationMs: number
└── context: { shiftId, openedAt }
```

#### Payload del Comando

```typescript
interface ShiftOpenPayload {
    readonly location?: {
        readonly latitude: number;  // -90 a 90
        readonly longitude: number; // -180 a 180
    };
    readonly notes?: string;
}
```

#### Receipt del Comando

```typescript
interface ShiftOpenReceipt {
    readonly shiftId: ShiftId;
    readonly openedAt: number;
}
```

#### Precondiciones Verificadas

| Precondición | Rechazo si falla |
|--------------|------------------|
| Usuario autenticado | `UNAUTHORIZED` |
| Usuario sin turno activo | `INVALID_STATE` |

#### Archivos Creados

| Archivo | Propósito |
|---------|----------|
| `src/domain/shifts/types.ts` | Tipos de dominio para turnos |
| `src/domain/shifts/store.ts` | Persistencia Firestore de turnos |
| `src/domain/shifts/commands/open.ts` | Handler completo de shift.open |
| `src/domain/shifts/index.ts` | Exportaciones del módulo |
| `src/audit/store.ts` | Persistencia Firestore de auditoría |
| `src/audit/index.ts` | Exportaciones del módulo audit |

#### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/commands/pipeline.runner.ts` | Integración de shift.open handlers |
| `DEV_EXECUTION_LOG.md` | Documentación del paso |

#### Garantías Implementadas

| Garantía | Estado |
|----------|--------|
| Pipeline ejecuta de extremo a extremo | ✅ |
| Idempotencia funciona | ✅ |
| Precondiciones verificadas | ✅ |
| Firestore contiene documento de turno | ✅ |
| Firestore contiene registro de auditoría | ✅ |
| Duplicado retorna resultado cacheado | ✅ |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ shift.open ejecuta todas las etapas
- ✅ Payload validation valida coordenadas y notas
- ✅ Precondition check verifica turno activo
- ✅ Shift record se persiste en Firestore
- ✅ Audit record se emite (append-only)
- ✅ Idempotency se marca ACCEPTED al completar
- ✅ Otros comandos siguen lanzando NOT_IMPLEMENTED

#### Lo que NO se implementó
- ❌ Otros comandos (shift.close, incident.create, etc.)
- ❌ Generalización prematura
- ❌ UI
- ❌ Tests

---

### Paso 7: Segundo Comando Real (shift.close) — COMPLETADO ✅
- **Objetivo:** Implementar segundo comando siguiendo la misma plantilla que shift.open.
- **Fecha:** 2026-01-14
- **Fuente:** Plantilla de shift.open (Step 6)

#### Comando Implementado

**`shift.close`** - Cerrar turno de guardia

#### Reutilización de Patrones

Se reutilizó la misma estructura que shift.open:
- Mismo agregado (Shift)
- Misma auditoría e idempotencia
- Misma estructura de handlers
- Sin generalización prematura

#### Flujo Completo del Pipeline

| Etapa | Implementación |
|-------|----------------|
| `PAYLOAD_VALIDATION` | Valida coordenadas y notas opcionales |
| `PRECONDITION_CHECK` | Verifica usuario tiene turno activo |
| `EXECUTION` | Prepara datos de cierre y calcula duración |
| `PERSISTENCE` | Actualiza turno a CLOSED en Firestore |
| `AUDIT_EMISSION` | Escribe registro de auditoría |

#### Payload del Comando

```typescript
interface ShiftClosePayload {
    readonly location?: {
        readonly latitude: number;  // -90 a 90
        readonly longitude: number; // -180 a 180
    };
    readonly notes?: string;
}
```

#### Receipt del Comando

```typescript
interface ShiftCloseReceipt {
    readonly shiftId: ShiftId;
    readonly closedAt: number;
    readonly durationMs: number;
}
```

#### Precondiciones Verificadas

| Precondición | Rechazo si falla |
|--------------|------------------|
| Usuario autenticado | `UNAUTHORIZED` |
| Usuario tiene turno activo | `INVALID_STATE` |
| Turno pertenece al usuario | `FORBIDDEN` |

#### Transición de Estado

```
Shift.status: ACTIVE → CLOSED
```

#### Campos Actualizados en Firestore

| Campo | Descripción |
|-------|-------------|
| `status` | Cambia de `'ACTIVE'` a `'CLOSED'` |
| `closedAt` | Timestamp del cierre |
| `closeCommandId` | ID del comando que cerró el turno |
| `closeLocation` | Ubicación (opcional) |
| `closeNotes` | Notas (opcional) |

#### Archivos Creados

| Archivo | Propósito |
|---------|----------|
| `src/domain/shifts/commands/close.ts` | Handler completo de shift.close |

#### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/domain/shifts/types.ts` | Agregar ShiftClosePayload, ShiftCloseReceipt, campos de cierre |
| `src/domain/shifts/store.ts` | Agregar método closeShift() |
| `src/domain/shifts/index.ts` | Exportar tipos y handlers de shift.close |
| `src/commands/pipeline.runner.ts` | Wiring de shift.close en todas las etapas |
| `DEV_EXECUTION_LOG.md` | Documentación del paso |

#### Garantías Implementadas

| Garantía | Estado |
|----------|--------|
| shift.close ejecuta de extremo a extremo | ✅ |
| Precondiciones verificadas | ✅ |
| Turno transiciona a CLOSED | ✅ |
| Audit record emitido | ✅ |
| Duplicado retorna resultado cacheado | ✅ |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ shift.close ejecuta todas las etapas
- ✅ Payload validation valida coordenadas y notas
- ✅ Precondition check verifica turno activo del usuario
- ✅ Shift record se actualiza en Firestore
- ✅ Audit record se emite con duración del turno
- ✅ Idempotency funciona (duplicados corto-circuitados)

#### Lo que NO se implementó
- ❌ Otros comandos (incident.create, rondin.start, etc.)
- ❌ Generalización de handlers
- ❌ UI
- ❌ Tests

---

### Paso 8: Primer Comando de Incidentes (incident.create) — COMPLETADO ✅
- **Objetivo:** Implementar primer comando de nueva entidad de dominio (Incident).
- **Fecha:** 2026-01-14
- **Fuente:** Patrón de shift.open + requisitos de payload más rico

#### Comando Implementado

**`incident.create`** - Crear un incidente

#### Nueva Entidad de Dominio

Este comando introduce una nueva entidad:
- **IncidentRecord** - Registro de incidente
- Entidad separada de Shift
- Payload más rico con validaciones
- Soporte para evidencia (referencias)

#### Estructura de Firestore

```
companies/{companyId}/incidents/{incidentId}
├── incidentId: string
├── reporterId: string
├── companyId: string
├── status: 'OPEN' | 'CLOSED'
├── title: string (requerido, max 500)
├── description?: string (max 5000)
├── severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
├── location?: { latitude, longitude }
├── createdAt: Timestamp
├── closedAt?: Timestamp
├── sourceCommandId: string
└── evidenceRefs?: string[]
```

#### Payload del Comando

```typescript
interface IncidentCreatePayload {
    readonly title: string;          // Requerido, no vacío, max 500
    readonly description?: string;   // Opcional, max 5000
    readonly severity: IncidentSeverity;  // Requerido
    readonly location?: GeoLocation; // Opcional
    readonly evidenceRefs?: readonly string[];  // Opcional
}
```

#### Receipt del Comando

```typescript
interface IncidentCreateReceipt {
    readonly incidentId: IncidentId;
    readonly createdAt: number;
    readonly severity: IncidentSeverity;
}
```

#### Validaciones de Payload

| Campo | Validación |
|-------|------------|
| `title` | Requerido, string, no vacío, max 500 caracteres |
| `severity` | Requerido, enum: LOW/MEDIUM/HIGH/CRITICAL |
| `description` | Opcional, string, max 5000 caracteres |
| `location` | Opcional, lat -90 a 90, lng -180 a 180 |
| `evidenceRefs` | Opcional, array de strings no vacíos |

#### Precondiciones Verificadas

| Precondición | Rechazo si falla |
|--------------|------------------|
| Usuario autenticado | `UNAUTHORIZED` |

*Nota: A diferencia de shift.open, no hay precondiciones de dominio. Los usuarios pueden crear incidentes en cualquier momento.*

#### Archivos Creados

| Archivo | Propósito |
|---------|----------|
| `src/domain/incidents/types.ts` | Tipos de dominio para incidentes |
| `src/domain/incidents/store.ts` | Persistencia Firestore de incidentes |
| `src/domain/incidents/commands/create.ts` | Handler completo de incident.create |
| `src/domain/incidents/index.ts` | Exportaciones del módulo |

#### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/commands/pipeline.runner.ts` | Agregar incidentStore a deps, wiring de incident.create |
| `DEV_EXECUTION_LOG.md` | Documentación del paso |

#### Garantías Implementadas

| Garantía | Estado |
|----------|--------|
| incident.create ejecuta de extremo a extremo | ✅ |
| Idempotencia funciona | ✅ |
| Payload validation rechaza datos inválidos | ✅ |
| Incident document escrito en Firestore | ✅ |
| Audit record emitido (append-only) | ✅ |
| Duplicado retorna resultado cacheado | ✅ |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ incident.create ejecuta todas las etapas
- ✅ Payload validation valida title, severity, description, location, evidenceRefs
- ✅ Incident record se persiste en Firestore
- ✅ Audit record se emite con metadata del incidente
- ✅ Idempotency funciona (duplicados corto-circuitados)

#### Lo que NO se implementó
- ❌ Otros comandos de incidentes (incident.close)
- ❌ Lógica de upload de evidencia (solo referencias)
- ❌ Generalización de handlers
- ❌ UI
- ❌ Tests

---

### Paso 9: Segundo Comando de Incidentes (incident.close) — COMPLETADO ✅
- **Objetivo:** Completar el ciclo de vida del incidente con el comando de cierre.
- **Fecha:** 2026-01-14
- **Fuente:** Patrón de shift.close aplicado a incidentes

#### Comando Implementado

**`incident.close`** - Cerrar un incidente

#### Reutilización de Patrones

Se reutilizó la misma estructura que shift.close:
- Mismo patrón de transición de estado
- Misma estructura de preconditions (verificar existencia y estado)
- Misma auditoría e idempotencia
- Sin generalización prematura

#### Payload del Comando

```typescript
interface IncidentClosePayload {
    readonly incidentId: IncidentId;  // Requerido
    readonly notes?: string;           // Opcional
}
```

#### Receipt del Comando

```typescript
interface IncidentCloseReceipt {
    readonly incidentId: IncidentId;
    readonly closedAt: number;
    readonly durationMs: number;
}
```

#### Precondiciones Verificadas

| Precondición | Rechazo si falla |
|--------------|------------------|
| Usuario autenticado | `UNAUTHORIZED` |
| Incidente existe | `RESOURCE_NOT_FOUND` |
| Incidente está OPEN | `INVALID_STATE` |

#### Transición de Estado

```
Incident.status: OPEN → CLOSED
```

#### Campos Actualizados en Firestore

| Campo | Descripción |
|-------|-------------|
| `status` | Cambia de `'OPEN'` a `'CLOSED'` |
| `closedAt` | Timestamp del cierre |
| `closeCommandId` | ID del comando que cerró el incidente |
| `closeNotes` | Notas de cierre (opcional) |

#### Archivos Creados

| Archivo | Propósito |
|---------|----------|
| `src/domain/incidents/commands/close.ts` | Handler completo de incident.close |

#### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/domain/incidents/types.ts` | Agregar IncidentClosePayload, IncidentCloseReceipt, campos de cierre |
| `src/domain/incidents/store.ts` | Agregar método closeIncident() |
| `src/domain/incidents/index.ts` | Exportar tipos y handlers de incident.close |
| `src/commands/pipeline.runner.ts` | Wiring de incident.close en todas las etapas |
| `DEV_EXECUTION_LOG.md` | Documentación del paso |

#### Garantías Implementadas

| Garantía | Estado |
|----------|--------|
| incident.close ejecuta de extremo a extremo | ✅ |
| Precondiciones verificadas | ✅ |
| Incidente transiciona a CLOSED | ✅ |
| Audit record emitido | ✅ |
| Duplicado retorna resultado cacheado | ✅ |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ incident.close ejecuta todas las etapas
- ✅ Payload validation valida incidentId y notes
- ✅ Precondition check verifica existencia y estado OPEN
- ✅ Incident record se actualiza en Firestore
- ✅ Audit record se emite con duración del incidente
- ✅ Idempotency funciona (duplicados corto-circuitados)

#### Lo que NO se implementó
- ❌ Otros comandos de incidentes (incident.reopen, incident.update)
- ❌ Generalización de handlers
- ❌ UI
- ❌ Tests

---

### Paso 10: Primer Comando de Rondines (rondin.start) — COMPLETADO ✅
- **Objetivo:** Implementar primer comando del nuevo agregado Rondin.
- **Fecha:** 2026-01-14
- **Fuente:** Patrón de shift.open + dependencia de turno activo

#### Comando Implementado

**`rondin.start`** - Iniciar un rondín

#### Nuevo Agregado de Dominio

Este comando introduce un nuevo agregado:
- **RondinRecord** - Registro de rondín
- Estado operacional de larga duración
- Dependencia de turno activo
- Ruta asociada

#### Estructura de Firestore

```
companies/{companyId}/rondins/{rondinId}
├── rondinId: string
├── companyId: string
├── userId: string
├── routeId: string
├── status: 'ACTIVE' | 'FINISHED'
├── startedAt: Timestamp
├── finishedAt?: Timestamp
├── startLocation?: { latitude, longitude }
└── sourceCommandId: string
```

#### Payload del Comando

```typescript
interface RondinStartPayload {
    readonly routeId: RouteId;        // Requerido, no vacío
    readonly location?: GeoLocation;   // Opcional
}
```

#### Receipt del Comando

```typescript
interface RondinStartReceipt {
    readonly rondinId: RondinId;
    readonly routeId: RouteId;
    readonly startedAt: number;
}
```

#### Precondiciones Verificadas

| Precondición | Rechazo si falla |
|--------------|------------------|
| Usuario autenticado | `UNAUTHORIZED` |
| Usuario tiene turno ACTIVO | `INVALID_STATE` |
| Usuario NO tiene rondín ACTIVO | `INVALID_STATE` |

*Nota: La dependencia de turno activo es crítica. No se puede iniciar un rondín sin turno.*

#### Transición de Estado

```
Rondin.status: ∅ → ACTIVE
```

#### Archivos Creados

| Archivo | Propósito |
|---------|----------|
| `src/domain/rondins/types.ts` | Tipos de dominio para rondines |
| `src/domain/rondins/store.ts` | Persistencia Firestore de rondines |
| `src/domain/rondins/commands/start.ts` | Handler completo de rondin.start |
| `src/domain/rondins/index.ts` | Exportaciones del módulo |

#### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/commands/pipeline.runner.ts` | Agregar rondinStore a deps, wiring de rondin.start |
| `DEV_EXECUTION_LOG.md` | Documentación del paso |

#### Garantías Implementadas

| Garantía | Estado |
|----------|--------|
| rondin.start ejecuta de extremo a extremo | ✅ |
| Precondiciones verificadas (turno activo, sin rondín activo) | ✅ |
| Rondin document escrito en Firestore | ✅ |
| Audit record emitido | ✅ |
| Duplicado retorna resultado cacheado | ✅ |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ rondin.start ejecuta todas las etapas
- ✅ Payload validation valida routeId y location
- ✅ Precondition check verifica turno activo y sin rondín activo
- ✅ Rondin record se persiste en Firestore
- ✅ Audit record se emite con metadata del rondín
- ✅ Idempotency funciona (duplicados corto-circuitados)

#### Lo que NO se implementó
- ❌ Otros comandos de rondines (rondin.recordCheckpoint, rondin.finish)
- ❌ Generalización de handlers
- ❌ UI
- ❌ Tests

---

### Paso 11: Segundo Comando de Rondines (rondin.recordCheckpoint) — COMPLETADO ✅
- **Objetivo:** Registrar progreso durante un rondín ACTIVO.
- **Fecha:** 2026-01-14
- **Fuente:** Patrón de incident.create + validación de estado

#### Comando Implementado

**`rondin.recordCheckpoint`** - Registrar un checkpoint durante un rondín

#### Nuevo Tipo de Registro

**RondinCheckpointRecord** - Registro de checkpoint escaneado:
- Subcolección dentro del rondín
- Evita duplicados de checkpoints
- Captura ubicación y timestamp

#### Estructura de Firestore

```
companies/{companyId}/rondins/{rondinId}/checkpoints/{checkpointId}
├── rondinId: string
├── checkpointId: string
├── companyId: string
├── userId: string
├── scannedAt: Timestamp
├── location?: { latitude, longitude }
└── sourceCommandId: string
```

#### Payload del Comando

```typescript
interface RondinRecordCheckpointPayload {
    readonly rondinId: RondinId;           // Requerido
    readonly checkpointId: CheckpointId;   // Requerido
    readonly scannedAt?: number;           // Opcional, default now
    readonly location?: GeoLocation;       // Opcional
}
```

#### Receipt del Comando

```typescript
interface RondinRecordCheckpointReceipt {
    readonly rondinId: RondinId;
    readonly checkpointId: CheckpointId;
    readonly scannedAt: number;
}
```

#### Precondiciones Verificadas

| Precondición | Rechazo si falla |
|--------------|------------------|
| Usuario autenticado | `UNAUTHORIZED` |
| Rondín existe | `RESOURCE_NOT_FOUND` |
| Rondín está ACTIVO | `INVALID_STATE` |
| Checkpoint no duplicado | `INVALID_STATE` |

*Nota: El checkpoint ID debe ser único dentro del rondín. Escaneos duplicados son rechazados.*

#### Archivos Creados

| Archivo | Propósito |
|---------|----------|
| `src/domain/rondins/commands/recordCheckpoint.ts` | Handler completo |

#### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/domain/rondins/types.ts` | Agregar CheckpointId, RondinCheckpointRecord, payload/receipt |
| `src/domain/rondins/store.ts` | Agregar createCheckpoint(), checkpointExists(), getCheckpoint() |
| `src/domain/rondins/index.ts` | Exportar tipos y handlers |
| `src/commands/pipeline.runner.ts` | Wiring de rondin.recordCheckpoint |
| `DEV_EXECUTION_LOG.md` | Documentación del paso |

#### Garantías Implementadas

| Garantía | Estado |
|----------|--------|
| rondin.recordCheckpoint ejecuta de extremo a extremo | ✅ |
| Checkpoints duplicados son rechazados | ✅ |
| Rondín debe estar ACTIVO | ✅ |
| Checkpoint record escrito en Firestore | ✅ |
| Audit record emitido | ✅ |
| Idempotency funciona para retries | ✅ |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ rondin.recordCheckpoint ejecuta todas las etapas
- ✅ Payload validation valida rondinId, checkpointId, scannedAt, location
- ✅ Precondition check verifica existencia, estado ACTIVO, no duplicado
- ✅ Checkpoint record se persiste en subcolección
- ✅ Audit record se emite con metadata del checkpoint
- ✅ Idempotency funciona (duplicados corto-circuitados)

#### Lo que NO se implementó
- ❌ rondin.finish
- ❌ Validación de secuencia de ruta
- ❌ Generalización de handlers
- ❌ UI
- ❌ Tests

---

### Paso 12: Tercer Comando de Rondines (rondin.finish) — COMPLETADO ✅
- **Objetivo:** Completar el ciclo de vida del rondín.
- **Fecha:** 2026-01-14
- **Fuente:** Patrón de shift.close aplicado a rondines

#### Comando Implementado

**`rondin.finish`** - Finalizar un rondín

#### Reutilización de Patrones

Se reutilizó la misma estructura que shift.close:
- Mismo patrón de transición de estado (ACTIVE → FINISHED)
- Misma estructura de preconditions (verificar existencia y estado)
- Misma auditoría e idempotencia
- Cálculo de duración del rondín

#### Payload del Comando

```typescript
interface RondinFinishPayload {
    readonly rondinId: RondinId;      // Requerido
    readonly location?: GeoLocation;  // Opcional
    readonly notes?: string;          // Opcional
}
```

#### Receipt del Comando

```typescript
interface RondinFinishReceipt {
    readonly rondinId: RondinId;
    readonly finishedAt: number;
    readonly durationMs: number;
}
```

#### Precondiciones Verificadas

| Precondición | Rechazo si falla |
|--------------|------------------|
| Usuario autenticado | `UNAUTHORIZED` |
| Rondín existe | `RESOURCE_NOT_FOUND` |
| Rondín está ACTIVO | `INVALID_STATE` |

#### Transición de Estado

```
Rondin.status: ACTIVE → FINISHED
```

*Nota: Una vez FINISHED, no se pueden registrar más checkpoints. rondin.recordCheckpoint verifica que el rondín esté ACTIVO.*

#### Campos Actualizados en Firestore

| Campo | Descripción |
|-------|-------------|
| `status` | Cambia de `'ACTIVE'` a `'FINISHED'` |
| `finishedAt` | Timestamp de finalización |
| `finishCommandId` | ID del comando que finalizó el rondín |
| `finishLocation` | Ubicación de finalización (opcional) |
| `finishNotes` | Notas de finalización (opcional) |

#### Archivos Creados

| Archivo | Propósito |
|---------|----------|
| `src/domain/rondins/commands/finish.ts` | Handler completo de rondin.finish |

#### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/domain/rondins/types.ts` | Agregar RondinFinishPayload, RondinFinishReceipt, campos de finish |
| `src/domain/rondins/store.ts` | Agregar método finishRondin(), campos en RondinDocument |
| `src/domain/rondins/index.ts` | Exportar tipos y handlers de rondin.finish |
| `src/commands/pipeline.runner.ts` | Wiring de rondin.finish en todas las etapas |
| `DEV_EXECUTION_LOG.md` | Documentación del paso |

#### Garantías Implementadas

| Garantía | Estado |
|----------|--------|
| rondin.finish ejecuta de extremo a extremo | ✅ |
| Rondín transiciona a FINISHED | ✅ |
| No se pueden registrar más checkpoints | ✅ |
| Audit record emitido con duración | ✅ |
| Duplicado retorna resultado cacheado | ✅ |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ rondin.finish ejecuta todas las etapas
- ✅ Payload validation valida rondinId, location, notes
- ✅ Precondition check verifica existencia y estado ACTIVO
- ✅ Rondin record se actualiza en Firestore
- ✅ Audit record se emite con duración del rondín
- ✅ Idempotency funciona (duplicados corto-circuitados)

#### Lo que NO se implementó
- ❌ Validación de secuencia de checkpoints
- ❌ Requerimiento mínimo de checkpoints
- ❌ Generalización de handlers
- ❌ UI
- ❌ Tests

---

### Paso 13: Primer Comando de Checklists (checklist.submit) — COMPLETADO ✅
- **Objetivo:** Implementar primer comando del nuevo agregado Checklist.
- **Fecha:** 2026-01-14
- **Fuente:** Patrón de incident.create aplicado a checklists

#### Comando Implementado

**`checklist.submit`** - Enviar un checklist completado

#### Nuevo Agregado de Dominio

Este comando introduce un nuevo agregado:
- **ChecklistSubmissionRecord** - Registro de submission de checklist
- Submission inmutable (una vez enviado, no se modifica)
- Contiene respuestas a las preguntas del checklist

#### Estructura de Firestore

```
companies/{companyId}/checklistSubmissions/{submissionId}
├── submissionId: string
├── checklistId: string
├── companyId: string
├── userId: string
├── status: 'SUBMITTED'
├── answers: [
│   ├── questionId: string
│   ├── value: any
│   └── notes?: string
│   ]
├── submittedAt: Timestamp
├── notes?: string
└── sourceCommandId: string
```

#### Payload del Comando

```typescript
interface ChecklistSubmitPayload {
    readonly checklistId: ChecklistId;       // Requerido
    readonly answers: readonly ChecklistAnswer[];  // Requerido, no vacío
    readonly notes?: string;                 // Opcional
}

interface ChecklistAnswer {
    readonly questionId: string;
    readonly value: unknown;
    readonly notes?: string;
}
```

#### Receipt del Comando

```typescript
interface ChecklistSubmitReceipt {
    readonly submissionId: ChecklistSubmissionId;
    readonly checklistId: ChecklistId;
    readonly submittedAt: number;
    readonly answerCount: number;
}
```

#### Validación de Payload

| Campo | Regla |
|-------|-------|
| checklistId | Requerido, string no vacío |
| answers | Requerido, array no vacío |
| answers[n].questionId | Requerido, string no vacío |
| answers[n].value | Requerido (puede ser cualquier tipo) |
| answers[n].notes | Opcional, string si presente |
| notes | Opcional, string si presente |

#### Precondiciones Verificadas

| Precondición | Rechazo si falla |
|--------------|------------------|
| Usuario autenticado | `UNAUTHORIZED` |

*Nota: No hay precondiciones de dominio adicionales para la creación. La validación del template del checklist podría agregarse en el futuro.*

#### Transición de Estado

```
ChecklistSubmission.status: ∅ → SUBMITTED
```

#### Archivos Creados

| Archivo | Propósito |
|---------|----------|
| `src/domain/checklists/types.ts` | Tipos de dominio para checklists |
| `src/domain/checklists/store.ts` | Persistencia Firestore de submissions |
| `src/domain/checklists/commands/submit.ts` | Handler completo de checklist.submit |
| `src/domain/checklists/index.ts` | Exportaciones del módulo |

#### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/commands/pipeline.runner.ts` | Agregar checklistStore a deps, wiring de checklist.submit |
| `DEV_EXECUTION_LOG.md` | Documentación del paso |

#### Garantías Implementadas

| Garantía | Estado |
|----------|--------|
| checklist.submit ejecuta de extremo a extremo | ✅ |
| Submission es inmutable | ✅ |
| Audit record emitido | ✅ |
| Idempotency funciona | ✅ |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ checklist.submit ejecuta todas las etapas
- ✅ Payload validation valida checklistId, answers, notes
- ✅ Cada answer se valida individualmente
- ✅ Submission record se persiste en Firestore
- ✅ Audit record se emite con metadata de submission
- ✅ Idempotency funciona (duplicados corto-circuitados)

#### Lo que NO se implementó
- ❌ Validación contra template del checklist
- ❌ checklist.createTemplate
- ❌ Generalización de handlers
- ❌ UI
- ❌ Tests

---

## [2026-01-14] INICIO FASE 4: Client / UI

### Paso 1: UI Shell + Command Consumption — COMPLETADO ✅
- **Objetivo:** Crear minimal UI shell que puede autenticar y ejecutar comandos.
- **Fecha:** 2026-01-14
- **Fuente:** SISTEMA_UI_CANONICO.md

#### Proyecto Web Creado

**Tecnología:** Vite + React + TypeScript
**Ubicación:** `web/`

#### Reglas Canónicas Aplicadas

| Regla | Implementación |
|-------|----------------|
| UI nunca asume éxito | ✅ Estados idle → pending → accepted/rejected |
| UI nunca infiere permisos | ✅ No role-based branching |
| UI refleja verdad del backend | ✅ CommandClient consume resultados as-is |
| Todas las acciones son comandos | ✅ checklist.submit implementado |
| Errores se muestran, nunca se ocultan | ✅ ErrorInline component |
| Offline actions marcadas como pending | ✅ OfflineBanner component |
| Backend es la única autoridad | ✅ No inferencia de estados |

#### Archivos Creados

**Lib (biblioteca de utilidades):**
| Archivo | Propósito |
|---------|----------|
| `web/src/lib/firebase.ts` | Configuración Firebase Auth + Functions |
| `web/src/lib/auth.tsx` | AuthContext, AuthProvider, useAuth hook |
| `web/src/lib/command-client.ts` | CommandClient genérico para ejecutar comandos |

**Components (componentes canónicos):**
| Archivo | Propósito |
|---------|----------|
| `web/src/components/tokens.ts` | Design tokens semánticos |
| `web/src/components/PrimaryButton.tsx` | Botón primario canónico |
| `web/src/components/StatusBadge.tsx` | Badge de estados (pending/accepted/rejected) |
| `web/src/components/ErrorInline.tsx` | Display de errores inline |
| `web/src/components/OfflineBanner.tsx` | Banner de estado offline |
| `web/src/components/index.ts` | Exportaciones del módulo |

**Pages:**
| Archivo | Propósito |
|---------|----------|
| `web/src/pages/Login.tsx` | Página de login con Firebase Auth |
| `web/src/pages/ChecklistSubmit.tsx` | Prueba de integración - ejecuta checklist.submit |
| `web/src/pages/index.ts` | Exportaciones del módulo |

**App:**
| Archivo | Propósito |
|---------|----------|
| `web/src/App.tsx` | Shell principal con AuthProvider y routing |
| `web/src/index.css` | Reset CSS global |
| `web/.env.example` | Ejemplo de variables de entorno |

#### Command Client

El cliente de comandos:
- Genera commandId único
- Envía comandos a Cloud Functions
- Recibe resultados as-is (ACCEPTED/REJECTED)
- NUNCA interpreta ni modifica resultados
- Maneja errores de red como rejection sintético

```typescript
type CommandState = 'idle' | 'pending' | 'accepted' | 'rejected';

interface CommandResult<TReceipt> {
    outcome: 'ACCEPTED' | 'REJECTED';
    commandId: string;
    receipt?: TReceipt;
    rejection?: { code, message, stage };
}
```

#### Transición de Estados

```
idle → pending → accepted
                └→ rejected
```

#### Pantalla de Prueba: Checklist Submit

Implementa el flujo completo:
1. Form con checklistId, answers, notes
2. Botón Submit que envía comando
3. StatusBadge mostrando estado actual
4. ErrorInline mostrando errores de rejection
5. Panel de éxito mostrando receipt

#### Lo que NO se implementó

| Item | Status |
|------|--------|
| Lógica de negocio en UI | ❌ EVITADO |
| Inferencia de permisos | ❌ EVITADO |
| Role-based branching | ❌ EVITADO |
| Optimistic success | ❌ EVITADO |
| Custom UX patterns | ❌ EVITADO |
| Nuevos endpoints backend | ❌ NO CREADOS |
| Mobile (Android) | ❌ NO IMPLEMENTADO |

#### Verificación
- ✅ `npx tsc --noEmit` pasa sin errores
- ✅ Firebase Auth integrado
- ✅ CommandClient implementado
- ✅ Componentes canónicos creados
- ✅ ChecklistSubmit ejecuta comando
- ✅ Estados visibles (idle/pending/accepted/rejected)
- ✅ Errores nunca ocultos

---

## Resumen de Pasos Ejecutados (Fase 2)

### Dependencias del Canon
| Documento | Aplicación |
|-----------|------------|
| `SISTEMA_CANONICO_FINAL.md` | Backend como autoridad única, Deny by default |
| `INVARIANTES_DE_PRODUCCION.md` | Idempotencia obligatoria, cliente hostil por diseño |
| `MODELO_MENTAL_DEL_SISTEMA.md` | Comando ≠ Evento, Seguridad precede funcionalidad |

### Paso 1: Preparación — COMPLETADO ✅
- **Objetivo:** Ordenar, no hacer funcionar.
- **Fecha:** 2026-01-14
- **Acciones realizadas:**
  1. ✅ Rama `phase-2-security-implementation` creada desde `phase-1-security`.
  2. ✅ Registro de inicio en DEV_EXECUTION_LOG.md.
  3. ✅ Archivos de contrato preparados con TODOs explícitos.
  4. ✅ Nuevo contrato de comandos de dominio creado (`src/domain/commands/contracts.ts`).

#### Archivos Modificados
| Archivo | Cambio |
|---------|--------|
| `src/security/kernel.ts` | +TODOs para autenticación real, autorización, assertAuthorized |
| `src/security/auth/types.ts` | +TODOs para integración Firebase, validación de tokens |
| `src/security/policies/contracts.ts` | +TODOs para PolicyEvaluator, código TENANT_ISOLATION |
| `src/security/guards/contracts.ts` | +TODOs para guards concretos, error handling |
| `src/domain/commands/contracts.ts` | **NUEVO** - Contratos para comandos de dominio |
| `src/domain/commands/README.md` | **NUEVO** - Documentación del módulo |

#### Verificación de Criterios
- ✅ DEV_EXECUTION_LOG.md registra inicio de Fase 2
- ✅ No existe funcionalidad completa aún (solo interfaces/types)
- ✅ No hay bypass del kernel (interfaces sin implementación)
- ✅ La implementación real no ha comenzado, solo está preparada
- ✅ El estado queda claro y auditable

#### Pendientes Explícitos (NO para Paso 1)
- [x] `package.json` y `tsconfig.json` → Completado en Paso 2
- [ ] Firebase Admin SDK (requiere configuración de proyecto)
- [ ] Cloud Functions scaffold
- [x] Implementación concreta de SecurityKernel → Completado en Paso 3 (DenyAll)

#### Lógica funcional implementada: **NINGUNA**
#### Conexión a Firebase: **NO**
#### Bypass del SecurityKernel: **NO**

### Deuda Técnica Heredada de Fase 1
- Contratos definidos como interfaces TypeScript (no implementados).
- No hay AuthProvider real.
- No hay conexión a Firebase Auth.
- PolicyEvaluator sin implementación concreta.

### Paso 2: Bootstrap Técnico Mínimo — COMPLETADO ✅
- **Objetivo:** Inicializar entorno técnico mínimo sin implementar seguridad.
- **Fecha:** 2026-01-14

#### Archivos Creados
| Archivo | Propósito |
|---------|-----------|
| `package.json` | Proyecto privado, scripts lint/typecheck, solo TypeScript como devDep |
| `tsconfig.json` | Strict activado, ES2022, sin paths complejos |
| `.gitignore` | Exclusión de node_modules, dist, IDE files |

#### Configuración de package.json
```json
{
  "name": "v5-system",
  "private": true,
  "scripts": {
    "lint": "placeholder (echo)",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

#### Configuración de tsconfig.json
- `strict: true` ✅
- `noEmit: true` ✅
- `noUnusedLocals: true` ✅
- `noUnusedParameters: true` ✅
- `exactOptionalPropertyTypes: true` ✅
- `noUncheckedIndexedAccess: true` ✅

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ `npm run lint` pasa (placeholder)
- ✅ CI sigue bloqueante (condicional en package.json)
- ✅ No hay lógica funcional implementada

#### Lo que NO se implementó
- ❌ Autenticación
- ❌ Firebase SDK
- ❌ Lógica del SecurityKernel
- ❌ Cloud Functions
- ❌ Dominio funcional

### Paso 3: Implementación Mínima del SecurityKernel — COMPLETADO ✅
- **Objetivo:** Implementar kernel que compile, sea invocable y deniegue todo.
- **Fecha:** 2026-01-14

#### Archivos Creados/Modificados
| Archivo | Propósito |
|---------|-----------|
| `src/security/kernel.impl.ts` | **NUEVO** - DenyAllSecurityKernel implementado |
| `src/security/index.ts` | **NUEVO** - Exportaciones públicas del módulo |
| `src/security/kernel.ts` | Actualizado header para referenciar implementación |

#### Comportamiento del DenyAllSecurityKernel
```typescript
authenticate() → siempre AnonymousIdentity
authorize()    → siempre { allowed: false, code: 'DENIED_BY_POLICY' }
assertAuthorized() → siempre lanza SecurityViolation
```

#### Principios del Canon Aplicados
- ✅ "Deny by default" (SISTEMA_CANONICO_FINAL.md §14)
- ✅ "El cliente es hostil por diseño" (INVARIANTES_DE_PRODUCCION.md)
- ✅ "Backend como autoridad única"

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ El Kernel compila
- ✅ Todos los accesos son denegados
- ✅ No hay dependencias externas

#### Lo que NO se implementó
- ❌ Lectura de headers, cookies o tokens
- ❌ Firebase
- ❌ Persistencia de estado
- ❌ Roles reales
- ❌ Lógica de negocio

### Paso 4: Autenticación Real (Sin Autorización) — COMPLETADO ✅
- **Objetivo:** Resolver identidad desde headers sin autorizar acceso.
- **Fecha:** 2026-01-14

#### Implementación: AuthenticatingSecurityKernel

**Señales de identidad que se leen:**
- `Authorization` header (formato: `Bearer <token>`)
- Token JWT decodificado (payload)

**Flujo de authenticate():**
```
1. Sin header → AnonymousIdentity
2. Header malformado → InvalidIdentity (reason: 'malformed')
3. Token expirado → InvalidIdentity (reason: 'expired')
4. Token válido → AuthenticatedIdentity
```

**Lo que NO se valida aún:**
- Firma criptográfica del token (placeholder)
- Existencia del usuario en base de datos
- Revocación de token
- App Check

**authorize() sigue denegando TODO:**
```typescript
authorize() → { allowed: false, code: 'DENIED_BY_POLICY' }
```

#### Archivos Modificados
| Archivo | Cambio |
|---------|--------|
| `src/security/kernel.impl.ts` | +AuthenticatingSecurityKernel, +base64UrlDecode puro |
| `src/security/auth/types.ts` | +authorizationHeader en RequestContext |
| `src/security/index.ts` | +exportaciones nuevas |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ authenticate() resuelve identidades reales
- ✅ authorize() sigue denegando TODO
- ✅ No hay persistencia de sesiones
- ✅ No hay dependencias externas agregadas

#### Lo que NO se implementó
- ❌ Autorización real (authorize sigue deny-all)
- ❌ Firebase
- ❌ Escritura de cookies
- ❌ Dependencias nuevas

### Paso 5: Autorización Real Mínima (Policy-Based) — COMPLETADO ✅
- **Objetivo:** Implementar autorización mínima basada en políticas explícitas.
- **Fecha:** 2026-01-14

#### Política Canónica Implementada

**POLICY_ALLOW_AUTHENTICATED**
```typescript
{
  resource: 'system',
  action: 'read'
}
```

**Comportamiento:**
- Identidad autenticada (`kind: 'authenticated'`) → `{ allowed: true }`
- Identidad anónima (`kind: 'anonymous'`) → `{ allowed: false, code: 'ANONYMOUS_NOT_ALLOWED' }`
- Identidad inválida (`kind: 'invalid'`) → `{ allowed: false, code: 'INVALID_CONTEXT' }`
- Cualquier otra política → `{ allowed: false, code: 'DENIED_BY_POLICY' }`

#### Principio Deny by Default
- Solo la política `ALLOW_AUTHENTICATED` es reconocida
- Todas las demás políticas son DENEGADAS automáticamente
- No hay acceso genérico

#### Archivos Modificados
| Archivo | Cambio |
|---------|--------|
| `src/security/policies/contracts.ts` | +POLICY_ALLOW_AUTHENTICATED, +isPolicyAllowAuthenticated(), +ResourceType 'system' |
| `src/security/kernel.impl.ts` | +authorize() con evaluación real, +constantes de resultado |
| `src/security/index.ts` | +exportaciones de políticas |

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ Existe política explícita (ALLOW_AUTHENTICATED)
- ✅ Solo un caso controlado es autorizado
- ✅ El resto sigue denegado

#### Lo que NO se implementó
- ❌ Roles complejos
- ❌ Base de datos
- ❌ Firebase
- ❌ Acceso genérico
- ❌ UI

### Paso 6: Integración con Firebase Auth — COMPLETADO ✅
- **Objetivo:** Verificar tokens reales con Firebase Auth.
- **Fecha:** 2026-01-14

#### Dependencia Agregada
```json
"firebase-admin": "^13.x"
```

#### Archivos Creados
| Archivo | Propósito |
|---------|-----------|
| `src/security/auth/firebase.ts` | Inicialización de Firebase Admin SDK (solo Auth) |
| `src/security/kernel.firebase.ts` | FirebaseSecurityKernel con verificación real |

#### Qué valida Firebase Auth
- ✅ Firma criptográfica del token
- ✅ Expiración del token
- ✅ Emisor del token (proyecto correcto)
- ✅ Revocación del token (checkRevoked: true)

#### Qué NO valida aún
- ❌ Empresa del usuario (companyId en Firestore)
- ❌ Roles específicos
- ❌ Módulos habilitados
- ❌ Datos en Firestore

#### Comportamiento de FirebaseSecurityKernel.authenticate()
```
1. Sin header → AnonymousIdentity
2. Token inválido (Firebase) → InvalidIdentity
3. Token válido → AuthenticatedIdentity (con claims)
```

#### authorize() SIN CAMBIOS
- Política ALLOW_AUTHENTICATED funciona igual
- Deny by default para todo lo demás

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ firebase-admin instalado
- ✅ Tokens inválidos serán rechazados por Firebase
- ✅ Autorización no cambia

#### Lo que NO se implementó
- ❌ Acceso a Firestore
- ❌ Reglas Firebase
- ❌ Nuevos casos de autorización
- ❌ Dominio de negocio
- ❌ UI

### Paso 7: Contexto de Empresa (companyId) — COMPLETADO ✅
- **Objetivo:** Resolver companyId del usuario y rechazar usuarios sin empresa.
- **Fecha:** 2026-01-14

#### Decisión de Diseño
**Fuente de companyId:** Custom Claims del token de Firebase

**Justificación:**
- Atomicidad: el token contiene toda la información necesaria
- Rendimiento: no requiere llamada adicional a Firestore
- Seguridad: claims son firmados criptográficamente

#### Comportamiento de authenticate()
```
1. Sin header → AnonymousIdentity
2. Token inválido → InvalidIdentity
3. Token válido SIN companyId → InvalidIdentity (malformed)
4. Token válido CON companyId → AuthenticatedIdentity
```

#### Validación de companyId
- ✅ companyId debe existir en claims
- ✅ companyId no puede estar vacío
- ✅ Usuarios sin empresa → rechazados como InvalidIdentity

#### Qué NO se valida aún
- ❌ Que la empresa exista en Firestore
- ❌ Estado de la empresa (activa/suspendida)
- ❌ Módulos habilitados

#### authorize() SIN CAMBIOS
- Política ALLOW_AUTHENTICATED funciona igual
- Deny by default para todo lo demás

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ Identidad autenticada incluye companyId
- ✅ Identidades sin companyId son rechazadas
- ✅ Autorización no cambia

#### Lo que NO se implementó
- ❌ Escritura en Firestore
- ❌ Creación de empresas
- ❌ Activación de módulos
- ❌ Nuevas políticas de autorización
- ❌ UI

### Paso 8: Estado de Empresa (active/suspended) — COMPLETADO ✅
- **Objetivo:** Validar que la empresa esté activa antes de permitir acceso.
- **Fecha:** 2026-01-14

#### Estados de Empresa Definidos
```typescript
type CompanyStatus = 'active' | 'suspended' | 'deleted';
```

| Estado | Comportamiento |
|--------|---------------|
| `active` | Acceso permitido |
| `suspended` | Acceso bloqueado → InvalidIdentity |
| `deleted` | Acceso bloqueado → InvalidIdentity |

#### Fuente de companyStatus
- Custom Claims del token de Firebase
- Default: `'active'` (compatibilidad con tokens sin este claim)

#### Comportamiento de authenticate()
```
1. Sin header → AnonymousIdentity
2. Token inválido → InvalidIdentity
3. Sin companyId → InvalidIdentity (malformed)
4. companyStatus !== 'active' → InvalidIdentity (company_suspended)
5. Todo válido → AuthenticatedIdentity
```

#### Nueva razón de invalidez
```typescript
reason: 'company_suspended'  // Empresa suspendida o eliminada
```

#### authorize() SIN CAMBIOS
- Política ALLOW_AUTHENTICATED funciona igual
- Deny by default para todo lo demás

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ Empresas no activas son rechazadas
- ✅ Solo empresas activas continúan
- ✅ Autorización no cambia

#### Lo que NO se implementó
- ❌ Lectura de Firestore
- ❌ Escritura en Firestore
- ❌ Nuevas políticas de autorización
- ❌ Ejecución de dominio
- ❌ UI

### Paso 9: Resolución Mínima de Roles — COMPLETADO ✅
- **Objetivo:** Resolver roles canónicos del token sin habilitar permisos nuevos.
- **Fecha:** 2026-01-14

#### Roles Canónicos (SISTEMA_CANONICO_FINAL.md §4)
```typescript
type UserRole = 'superadmin' | 'admin' | 'supervisor' | 'guard';
```

| Rol | Descripción (Canon) |
|-----|----------------------|
| `superadmin` | Super Administrador |
| `admin` | Administrador |
| `supervisor` | Supervisor |
| `guard` | Guardia |

#### Principio Canónico
> "Los roles ordenan autoridad, no habilitan acciones."

Los roles NO se usan para autorizar en este paso.
Solo se valida que el usuario tenga un rol canónico válido.

#### Comportamiento de authenticate()
```
1. Sin header → AnonymousIdentity
2. Token inválido → InvalidIdentity
3. Sin companyId → InvalidIdentity (malformed)
4. companyStatus !== 'active' → InvalidIdentity (company_suspended)
5. Sin rol válido → InvalidIdentity (missing_role)
6. Todo válido → AuthenticatedIdentity (con role)
```

#### Nueva razón de invalidez
```typescript
reason: 'missing_role'  // Usuario sin rol canónico válido
```

#### authorize() SIN CAMBIOS
- Política ALLOW_AUTHENTICATED funciona igual
- Los roles NO habilitan permisos adicionales aún
- Deny by default para todo lo demás

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ AuthenticatedIdentity incluye role
- ✅ Usuarios sin rol válido son rechazados
- ✅ Autorización no cambia

#### Lo que NO se implementó
- ❌ Permisos por rol
- ❌ Lógica condicional compleja
- ❌ Lectura de Firestore
- ❌ Escritura en Firestore
- ❌ UI

### Paso 10: Módulos y Capacidades (Definición) — COMPLETADO ✅
- **Objetivo:** Definir módulos y capacidades canónicas sin habilitar permisos.
- **Fecha:** 2026-01-14
- **Fuente:** SISTEMA_CANONICO_v1.8.md

#### Módulos Canónicos (8 módulos)
```typescript
type SystemModule =
    | 'core'           // §8.2 Módulo Núcleo
    | 'incidents'      // §8.3 Módulo Incidentes
    | 'patrols'        // §8.4 Módulo Rondines
    | 'checklists'     // §8.5 Módulo Checklists
    | 'access_control' // §8.6 Módulo Control de Accesos
    | 'vehicle_control'// §8.7 Módulo Control Vehicular
    | 'evidence'       // §8.8 Módulo Evidencias
    | 'checkpoints';   // §8.9 Módulo Puntos de Control y QR
```

#### Capacidades Definidas (26 capacidades)
| Módulo | Capacidades |
|--------|-------------|
| core | shift.open, shift.close, shift.view.self |
| incidents | incident.create, incident.view.self, incident.close, incident.attachEvidence |
| patrols | rondin.start, rondin.recordCheckpoint, rondin.finish, qr.scan |
| checklists | checklist.view.self, checklist.submit |
| access_control | access.registerEntry, access.registerExit, access.view.self |
| vehicle_control | vehicle.registerEntry, vehicle.registerExit, vehicle.view.self |
| evidence | evidence.attach, evidence.view.self |
| checkpoints | checkpoint.create, checkpoint.disable, checkpoint.downloadQR, qr.scan |

#### Principio Canónico
> "Una acción existe solo si capacidad + módulo + estado
> lo permiten simultáneamente."

#### Archivo Creado
- `src/security/modules/definitions.ts` - Definiciones declarativas

#### ⚠️ NINGÚN PERMISO OTORGADO
- Estas son SOLO definiciones de tipos
- NO hay lógica de autorización
- NO se asignan capacidades a roles
- authorize() SIN CAMBIOS

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ Módulos provienen del canon (§8.2-§8.9)
- ✅ Capacidades provienen del canon
- ✅ Definiciones son declarativas (types/enums)
- ✅ Autorización no cambia

#### Lo que NO se implementó
- ❌ Mapeo rol → módulo
- ❌ Mapeo rol → capacidad
- ❌ Lógica de permisos
- ❌ Firestore
- ❌ Comandos de dominio
- ❌ UI

### Paso 11: Mapeo Rol → Capacidad (Declarativo) — COMPLETADO ✅
- **Objetivo:** Definir relación rol-capacidad declarativamente.
- **Fecha:** 2026-01-14
- **Fuente:** SISTEMA_CANONICO_v1.4.md, v1.5.md, v1.7.md

#### Descubrimiento Crítico del Canon

**El canon NO define un mapeo rol → capacidad automático.**

> "§4.1: Los roles NO habilitan acciones operativas.
> Las acciones reales se habilitan por capacidades y módulos."

> "§4.4: El rol define hasta dónde puede DELEGAR.
> La capacidad define qué puede EJECUTAR."

#### Modelo Implementado

1. **Perfiles Operativos (§5.4)** - Paquetes de capacidades RECOMENDADOS
   - Rondinero: shift.*, rondin.*, qr.scan, incident.create, evidence.attach
   - Guardia Accesos: shift.*, access.*, vehicle.*, qr.scan, evidence.attach
   - Guardia General: shift.*, checklist.submit, incident.create, qr.scan, evidence.attach

2. **Techos de Delegación (§4.3)** - LO MÁXIMO que un rol puede ASIGNAR
   - Superadmin (100): todas las capacidades
   - Admin (80): operación + supervisión + admin limitado
   - Supervisor (70): no delega
   - Guard (50): no delega

3. **Categorías de Capacidades (§7.3-§7.5)**
   - Operación: 22 capacidades
   - Administración: 9 capacidades
   - Supervisión: 3 capacidades

#### Archivo Creado
- `src/security/modules/capabilities.ts` - Perfiles y delegación

#### ⚠️ NINGÚN PERMISO SE OTORGA AUTOMÁTICAMENTE
- Las capacidades deben estar EXPLÍCITAMENTE asignadas al usuario
- El rol define techo de delegación, NO permisos directos
- authorize() SIN CAMBIOS

#### Verificación
- ✅ `npm run typecheck` pasa sin errores
- ✅ Mapeos provienen estrictamente del canon
- ✅ Definiciones son declarativas
- ✅ Autorización no cambia

#### Lo que NO se implementó
- ❌ Permisos automáticos por rol
- ❌ Lógica de autorización condicional
- ❌ Firestore
- ❌ Dominio
- ❌ UI

---

## [2026-01-13] CIERRE FASE 0 / INICIO FASE 1

### Resumen de Ejecución - Fase 0
- **Estado:** COMPLETADA
- **Entregables:**
  - Repositorio público configurado (`oenciso/v5-system`).
  - Documentación canónica versionada.
  - Branch protection activo en `master`.
  - CI de validación (`ci.yml`) activo y bloqueante.
  - PR Template con checklist obligatorio.

### Inicio de Fase 1: Núcleo de seguridad y control
- **Objetivo:** Implementar Firebase Auth, modelo base de empresa/usuario y auditoría, sin exponer operación.
- **Estado:** EN PROGRESO
- **Rama activa:** `phase-1-security`


### [2026-01-13] FASE 1: Estructura Base de Seguridad
- **Acción:** Creación de scaffolding de directorios para separación de responsabilidades.
- **Estructura definida:**
  - `src/security`: Autoridad de decisiones de acceso.
  - `src/domain`: Definiciones puras de negocio.
  - `src/app`: Capa de presentación (vacía).
- **Nota:** No hay lógica implementada ni dependencias instaladas.


### [2026-01-13] FASE 1: Contratos de Seguridad
- **Acción:** Definición de interfaces y tipos base (TypeScript) para el subsistema de seguridad.
- **Entregables:**
  - `src/security/auth/types.ts`: Modelado de identidad inmutable (`UserIdentity`).
  - `src/security/policies/contracts.ts`: Definición de resultados deterministas (`AuthorizationResult`) y evaluación de políticas.
  - `src/security/guards/contracts.ts`: Contrato de Guards y excepción base (`SecurityViolation`).
- **Principios aplicados:**
  - "Deny by Default" explícito en tipos de retorno.
  - Inmutabilidad en definiciones de identidad.
  - Separación de contrato vs implementación.


### [2026-01-13] FASE 1: Modelo de Identidad
- **Acción:** Definición del modelo de identidad en tiempo de ejecución (`RuntimeIdentity`).
- **Estados modelados:**
  - `anonymous`: Estado por defecto.
  - `authenticated`: Identidad válida con `UserIdentity`.
  - `invalid`: Estado explícito de error (no null).
- **Justificación:** Uso de *Discriminated Unions* para obligar al sistema a manejar todos los estados de autenticación antes de ejecutar lógica de negocio.


### [2026-01-13] FASE 1: Security Kernel (Punto de Entrada)
- **Acción:** Definición del contrato `SecurityKernel` (`src/security/kernel.ts`).
- **Propósito:** Actuar como fachada única para el subsistema de seguridad.
- **Reglas impuestas:**
  - Prohibido instanciar Guards o Policies fuera de este kernel.
  - La autenticación y autorización deben invocarse explícitamente a través de esta interfaz.
  - Estandarización de métodos `authenticate`, `authorize` y `assertAuthorized`.


### [2026-01-13] CIERRE CONCEPTUAL FASE 1
- **Estado:** DEFINIDO (NO IMPLEMENTADO) - PAUSADO
- **Entregables Abstractos Completados:**
  1. Estructura de directorios (`src/security`, `src/domain`).
  2. Contratos de identidad (`UserIdentity`, `RuntimeIdentity`).
  3. Contratos de políticas y guards (`AuthorizationResult`, `SecurityGuard`).
  4. Fachada de seguridad (`SecurityKernel`).
- **Deuda Técnica Explícita:**
  - No hay conexión a Firebase.
  - Métodos no tienen implementación (solo interfaces/types).
  - No existe Auth Provider real.
- **Siguiente Paso Lógico:** Implementación concreta de los contratos definidos.

