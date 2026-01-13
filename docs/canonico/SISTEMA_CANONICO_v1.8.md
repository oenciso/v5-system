# SISTEMA_CANONICO_v1.8.md

## 8. Mapeo capacidades → módulos → reglas

Esta sección define cómo una acción pasa de intención a ejecución válida.
Nada se ejecuta sin cumplir **todas** las condiciones.

---

## 8.1 Regla global (aplica a todo)

Para permitir cualquier acción:

1. Usuario autenticado.
2. Usuario `active`.
3. Empresa `active`.
4. Módulo requerido **activo**.
5. Capacidad explícita presente.
6. Recurso pertenece a la misma empresa.
7. Estado del recurso permite la acción.
8. Auditoría generada.

Si una falla → **deny**.

---

## 8.2 Módulo Núcleo

Incluye:
- autenticación
- usuarios
- empresa
- turnos

### Capacidades
- `shift.open`
- `shift.close`
- `shift.view.self`

### Reglas clave
- Un usuario solo puede tener un turno abierto.
- Sin turno abierto no hay operación.
- Cierre irreversible (excepto supervisado).

---

## 8.3 Módulo Incidentes

### Capacidades
- `incident.create`
- `incident.view.self`
- `incident.close`
- `incident.attachEvidence`

### Reglas
- Turno `open`.
- Incidente pertenece a la empresa.
- Cierre irreversible.
- Evidencia solo ligada a incidente existente.

---

## 8.4 Módulo Rondines

### Capacidades
- `rondin.start`
- `rondin.recordCheckpoint`
- `rondin.finish`
- `qr.scan`

### Reglas
- Turno `open`.
- Ruta asignada.
- Orden válido (start → checkpoints → finish).
- Escaneo QR valida punto y empresa.

---

## 8.5 Módulo Checklists

### Capacidades
- `checklist.view.self`
- `checklist.submit`

### Reglas
- Turno `open`.
- Checklist asignado.
- Envío único por turno.

---

## 8.6 Módulo Control de Accesos

### Capacidades
- `access.registerEntry`
- `access.registerExit`
- `access.view.self`

### Reglas
- Turno `open`.
- Secuencia válida (entry → exit).
- Ubicación válida.

---

## 8.7 Módulo Control Vehicular

### Capacidades
- `vehicle.registerEntry`
- `vehicle.registerExit`
- `vehicle.view.self`

### Reglas
- Turno `open`.
- Secuencia válida por placa.
- Asociación a ubicación.

---

## 8.8 Módulo Evidencias (transversal)

### Capacidades
- `evidence.attach`
- `evidence.view.self`

### Reglas
- Evidencia ligada a evento real.
- Storage validado contra Firestore.
- Hash obligatorio.

---

## 8.9 Módulo Puntos de Control y QR

### Capacidades
- `checkpoint.create`
- `checkpoint.disable`
- `checkpoint.downloadQR`
- `qr.scan`

### Reglas
- Puntos pertenecen a una empresa.
- QR invalida si el punto está deshabilitado.
- Escaneo fuera de contexto se rechaza.

---

## Regla de cierre

> Una acción existe solo si
> capacidad + módulo + estado
> lo permiten simultáneamente.
