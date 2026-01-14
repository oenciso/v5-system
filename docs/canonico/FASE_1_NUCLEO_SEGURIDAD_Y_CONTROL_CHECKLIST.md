# FASE_1_NUCLEO_SEGURIDAD_Y_CONTROL_CHECKLIST.md

## Fase 1 — Núcleo de seguridad y control (Checklist detallada)

Esta fase establece **la base de seguridad** del sistema.
No se implementa operación ni UX avanzada.
Si un punto falla, **no se avanza**.

---

## 1. Preparación técnica

- [ ] Proyecto Firebase creado (dev).
- [ ] Proyecto Firebase creado (prod).
- [ ] Variables de entorno separadas y protegidas.
- [ ] SDK Firebase inicializado en server y client.
- [ ] App Check habilitado (registro de apps listo).

---

## 2. Autenticación (Auth ≠ Autorización)

- [ ] Login funcional (email/password u OAuth definido).
- [ ] `request.auth` presente en reglas.
- [ ] Tokens **no** contienen permisos finales.
- [ ] Usuario autenticado **no** puede operar sin validaciones backend.
- [ ] Manejo de sesión seguro (web).

---

## 3. Modelo Empresa (canónico)

### Esquema y estados
- [ ] Documento `company` definido.
- [ ] Campos estructurales mínimos:
  - `id`
  - `status` (pending_payment | pending_review | active | suspended | deleted)
  - `enabledModules[]`
  - `createdAt`
  - `version`
- [ ] Estado inicial definido explícitamente.
- [ ] Transiciones de estado validadas en backend.

### Reglas
- [ ] Empresa `active` es la única operativa.
- [ ] `suspended` bloquea toda operación.
- [ ] `deleted` es terminal e irreversible.
- [ ] No hay updates directos desde cliente.

---

## 4. Modelo Usuario (canónico)

### Esquema y estados
- [ ] Documento `user` definido.
- [ ] Campos estructurales mínimos:
  - `id`
  - `companyId`
  - `role` (Superadmin | Administrador | Supervisor | Guardia)
  - `status` (active | suspended)
  - `createdAt`
  - `version`

### Reglas
- [ ] Usuario pertenece a **una sola empresa**.
- [ ] Usuario `suspended` no ejecuta comandos.
- [ ] Rol **no** otorga permisos operativos.
- [ ] Capacidades aún no habilitan acciones.

---

## 5. Auditoría mínima (obligatoria)

- [ ] Estructura `audit_event` definida.
- [ ] Auditoría escrita **solo desde backend**.
- [ ] Se audita:
  - creación de empresa
  - cambio de estado de empresa
  - creación de usuario
  - cambio de estado de usuario
- [ ] Auditoría inmutable (sin update/delete).
- [ ] Timestamp de servidor obligatorio.

---

## 6. Cloud Functions base

- [ ] Infraestructura CF creada.
- [ ] Funciones protegidas por Auth.
- [ ] Validaciones en orden canónico:
  1. Auth
  2. Usuario activo
  3. Empresa activa
- [ ] Escrituras en transacción.
- [ ] Errores tipados y explícitos.

---

## 7. Reglas Firebase (base)

### Firestore
- [ ] Deny by default confirmado.
- [ ] Lecturas filtradas por `companyId`.
- [ ] Escrituras críticas bloqueadas desde cliente.
- [ ] No existen queries globales.

### Storage
- [ ] Acceso denegado por defecto.
- [ ] Sin acceso público.
- [ ] Rutas por empresa (aunque aún no se usen).

---

## 8. Aislamiento multiempresa (crítico)

- [ ] Un usuario no puede leer otra empresa.
- [ ] Un usuario no puede escribir en otra empresa.
- [ ] Tests manuales de cruce fallan correctamente.
- [ ] No existen IDs “adivinables”.

---

## 9. UX mínima (alineada a UX canónica)

- [ ] UI no asume éxito.
- [ ] Estados de error visibles.
- [ ] No hay confirmaciones falsas.
- [ ] No hay lógica de permisos en cliente.

---

## 10. CI y calidad

- [ ] Lint pasa.
- [ ] Typecheck pasa.
- [ ] Build pasa.
- [ ] PR requiere checklist completa.
- [ ] CI bloquea merge ante fallo.

---

## Criterio de cierre de Fase 1

> Fase 1 se cierra solo si:
> - la seguridad base está blindada
> - no existe operación activa
> - no hay bypass posible
> - auditoría funciona

Sin excepciones.
