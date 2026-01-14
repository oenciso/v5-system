# SISTEMA_CANONICO_v1.11.md

## 11. Modelo de datos

Esta sección define el **modelo de datos lógico** del sistema.
No es un esquema técnico detallado, es el **contrato de persistencia**.

El modelo de datos no asume consistencia perfecta del cliente.

---

## 11.1 Principios

- Todo documento pertenece a una empresa.
- No existen documentos huérfanos.
- Los estados son explícitos.
- No hay updates genéricos.
- Auditoría separada del dato operativo.

---

## 11.2 Entidades núcleo

### Empresa (`company`)

Campos clave:
- `id`
- `status` (pending_payment | pending_review | active | suspended | deleted)
- `enabledModules[]`
- `createdAt`
- `version`

Reglas:
- `deleted` es irreversible.
- `active` es el único estado operativo.

---

### Usuario (`user`)

Campos clave:
- `id`
- `companyId`
- `role`
- `capabilities[]`
- `status` (active | suspended)
- `createdAt`
- `version`

Reglas:
- Un usuario pertenece a una sola empresa.
- `suspended` no puede ejecutar comandos.

---

### Turno (`shift`)

Campos clave:
- `id`
- `companyId`
- `userId`
- `status` (open | closed)
- `openedAt`
- `closedAt`

Reglas:
- Un usuario solo puede tener un turno `open`.
- Turno `closed` es solo lectura.

---

## 11.3 Entidades operativas

### Incidente (`incident`)

Campos clave:
- `id`
- `companyId`
- `shiftId`
- `status` (open | closed)
- `type`
- `createdAt`
- `closedAt`
- `version`

---

### Rondín (`rondin`)

Campos clave:
- `id`
- `companyId`
- `shiftId`
- `mode` (routed | free)
- `routeId` (opcional)
- `status` (started | finished)
- `startedAt`
- `finishedAt`

---

### Checkpoint / Punto de control (`checkpoint`)

Campos clave:
- `id`
- `companyId`
- `status` (active | disabled)
- `qrHash`
- `createdAt`

---

### Checklist (`checklist`)

Campos clave:
- `id`
- `companyId`
- `shiftId`
- `templateId`
- `submittedAt`
- `version`

Reglas:
- Uno por turno y asignación.

---

## 11.4 Evidencias

### Evidencia (`evidence`)

Campos clave:
- `id`
- `companyId`
- `refType`
- `refId`
- `storagePath`
- `hash`
- `createdAt`
- `createdBy`

Reglas:
- Siempre ligada a un evento real.
- Nunca editable.

---

## 11.5 Administración y control

### Comando procesado (`command_receipt`)

Campos clave:
- `commandId`
- `companyId`
- `status` (accepted | rejected)
- `processedAt`
- `reason` (si aplica)

---

### Auditoría (`audit_event`)

Campos clave:
- `id`
- `companyId`
- `actorId`
- `action`
- `target`
- `origin`
- `createdAt`

Reglas:
- Inmutable.
- Sin delete.
- Sin update.

---

## 11.6 Versionado y evolución

- Entidades tienen `version`.
- Cambios incompatibles crean nueva versión.
- No se reinterpretan datos históricos.

---

## Regla de cierre

> El modelo de datos protege la verdad histórica.
> Si un dato no puede explicarse,
> no debe persistirse.
