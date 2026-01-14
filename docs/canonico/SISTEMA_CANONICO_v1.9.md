# SISTEMA_CANONICO_v1.9.md

## 9. Comandos de dominio

Esta sección define **cómo se ejecutan las acciones reales** del sistema.
Las acciones no son updates directos.
Son **comandos explícitos**, validados y auditados.

Todo comando debe ser seguro
incluso si es inválido, repetido o tardío.

---

## 9.1 Principios

- Todo cambio de estado ocurre por un comando.
- Los comandos son intenciones, no resultados.
- Los comandos son:
  - inmutables
  - idempotentes
  - auditables
- El backend decide el resultado final.

---

## 9.2 Estructura base de un comando

Todo comando sigue este contrato lógico:

- `commandId` (único, idempotencia)
- `commandType`
- `companyId`
- `actorId`
- `origin` (android | web)
- `module`
- `capability`
- `payload` (mínimo necesario)
- `clientTimestamp`
- `version`

El backend recalcula:
- timestamp servidor
- hash del payload

---

## 9.3 Flujo de ejecución

1. Cliente genera comando.
2. Comando se envía a backend.
3. Backend valida:
   - auth
   - estado usuario
   - estado empresa
   - módulo activo
   - capacidad
   - reglas de secuencia
4. Backend:
   - ejecuta en transacción
   - genera auditoría
   - registra recibo del comando
5. Backend responde:
   - accepted
   - rejected (con razón tipada)

---

## 9.4 Idempotencia

- Cada `commandId` se procesa una sola vez.
- Reintentos devuelven el mismo resultado.
- La idempotencia es obligatoria para offline-first.

---

## 9.5 Lista inicial de comandos

### Turnos
- `shift.open`
- `shift.close`
- `shift.close.supervised`

---

### Incidentes
- `incident.create`
- `incident.close`

---

### Rondines
- `rondin.start`
- `rondin.recordCheckpoint`
- `rondin.finish`

---

### Checklists
- `checklist.submit`

---

### Control de accesos
- `access.registerEntry`
- `access.registerExit`

---

### Control vehicular
- `vehicle.registerEntry`
- `vehicle.registerExit`

---

### Evidencias
- `evidence.attach`

---

### Puntos de control / QR
- `checkpoint.create`
- `checkpoint.disable`

---

## 9.6 Versionado de comandos

- Los comandos tienen `version`.
- Cambios incompatibles:
  - nueva versión
  - reglas separadas
- Versiones antiguas:
  - se mantienen
  - no se reinterpretan

---

## 9.7 Qué NO son los comandos

Los comandos NO son:
- updates genéricos
- endpoints REST abiertos
- lógica de UI
- operaciones optimistas finales

---

## Regla de cierre

> Si una acción no es un comando,
> no puede cambiar el estado del sistema.
