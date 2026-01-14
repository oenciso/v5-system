# SISTEMA_CANONICO_v1.8.1.md

## 8. Mapeo capacidades → módulos → reglas

## 8.4 Módulo Rondines (actualizado)

El módulo de rondines soporta **dos modos operativos explícitos**.
El modo se define por empresa y aplica a toda la operación.

No es implícito.
No es heurístico.
No se infiere del cliente.

---

## 8.4.1 Modos de operación

### Modo `routed` (con ruta asignada)

Diseñado para operación estricta y auditoría formal.

**Características**
- El rondín debe seguir una ruta predefinida.
- Los puntos de control están ordenados.
- El backend valida orden y completitud.

**Reglas**
- Turno `open`.
- Ruta asignada obligatoria.
- `rondin.start` requiere `routeId`.
- `rondin.recordCheckpoint`:
  - el QR debe pertenecer a la ruta
  - el orden debe ser válido
- `rondin.finish` solo permitido si la ruta se completó.
- Escaneo QR valida:
  - punto
  - empresa
  - pertenencia a la ruta

---

### Modo `free` (rondín libre)

Diseñado para operación flexible y contextos dinámicos.

**Características**
- No existe ruta predefinida.
- El guardia escanea puntos en campo.
- No hay orden obligatorio.

**Reglas**
- Turno `open`.
- `rondin.start` no requiere ruta.
- `rondin.recordCheckpoint` valida:
  - QR existente
  - pertenencia a la empresa
  - no duplicidad dentro del mismo rondín
- `rondin.finish` siempre permitido.
- Escaneo QR valida:
  - punto
  - empresa

---

## 8.4.2 Capacidades (sin cambios)

- `rondin.start`
- `rondin.recordCheckpoint`
- `rondin.finish`
- `qr.scan`

Las capacidades no cambian entre modos.
El **modo afecta reglas**, no permisos.

---

## 8.4.3 Configuración del modo

- El modo (`routed` | `free`) se define a nivel empresa.
- Solo puede ser configurado por:
  - Superadmin
  - Administrador (si está permitido)
- Todo cambio de modo:
  - se audita
  - no afecta rondines históricos

---

## Regla de cierre

> El modo define el rigor operativo,
> no las capacidades del usuario.

El backend valida el modo en cada acción.
