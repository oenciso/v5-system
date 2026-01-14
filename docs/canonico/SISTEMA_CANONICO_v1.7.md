# SISTEMA_CANONICO_v1.7.md

## 7. Capacidades

Esta sección define las **capacidades** del sistema.
Las capacidades son el **contrato real de lo que un usuario puede hacer**.

Las capacidades permiten intentar acciones,
pero nunca garantizan que la acción sea aceptada.

---

## 7.1 Principios

- Toda acción requiere una capacidad explícita.
- No existen permisos implícitos.
- Las capacidades son atómicas.
- Las capacidades se evalúan **solo en backend**.
- La UI refleja capacidades, no las decide.

---

## 7.2 Convención de nombres

Formato:
```
<dominio>.<acción>
```

Ejemplos:
- `shift.open`
- `incident.create`
- `qr.scan`

Reglas:
- Verbos claros.
- Sin comodines.
- Sin jerarquías ocultas.

---

## 7.3 Capacidades base (operación)

### Turnos
- `shift.open`
- `shift.close`
- `shift.view.self`

---

### Incidentes
- `incident.create`
- `incident.view.self`
- `incident.close`
- `incident.attachEvidence`

---

### Rondines
- `rondin.start`
- `rondin.recordCheckpoint`
- `rondin.finish`
- `rondin.view.self`

---

### Códigos QR / Puntos de control
- `qr.scan`
- `checkpoint.view.self`

---

### Checklists
- `checklist.view.self`
- `checklist.submit`

---

### Control de accesos
- `access.registerEntry`
- `access.registerExit`
- `access.view.self`

---

### Control vehicular
- `vehicle.registerEntry`
- `vehicle.registerExit`
- `vehicle.view.self`

---

### Evidencias (transversal)
- `evidence.attach`
- `evidence.view.self`

---

## 7.4 Capacidades administrativas (empresa)

- `user.invite`
- `user.suspend`
- `user.assignCapabilities`
- `user.assignProfile`

- `module.enable`
- `module.disable`

- `checkpoint.create`
- `checkpoint.disable`
- `checkpoint.downloadQR`

---

## 7.5 Capacidades de supervisión

- `operation.view.assigned`
- `incident.close.supervised`
- `shift.close.supervised`

---

## 7.6 Evolución de capacidades

- Agregar una feature = agregar capacidades nuevas.
- Nunca se reutilizan capacidades con semántica distinta.
- Capacidades obsoletas se deprecian, no se reutilizan.
- Toda capacidad nueva requiere:
  - documentación
  - reglas
  - auditoría

---

## 7.7 Qué NO son las capacidades

Las capacidades NO son:
- roles
- módulos
- presets de UI
- flags temporales

---

## Regla de cierre

> Si una acción no tiene capacidad,
> la acción no existe para el sistema.
