# DEV_EXECUTION_LOG.md

---

## [2026-01-14] INICIO FASE 2: Implementación Real de Seguridad

### Advertencia
⚠️ **La implementación de esta fase será INCREMENTAL.**  
No se implementará lógica funcional completa en un solo paso.  
Cada sub-paso debe ser atómico, auditable y reversible.

### Estado
- **Fase:** 2 - Implementación Real de Seguridad
- **Paso Actual:** 9 - Resolución mínima de roles
- **Estado:** EN PROGRESO
- **Rama:** `phase-2-security-implementation`

### Alcance de la Fase 2
Según RFC-0 (Fase 2 - Infraestructura de comandos):
- Infraestructura de Cloud Functions
- Contrato de comando
- Tabla de idempotencia
- Rechazos tipados
- Auditoría integrada

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

