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
- **Fase:** 3 - Infraestructura de Comandos
- **Paso Actual:** 2 - Modelo de Idempotencia
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

