# SISTEMA_CANONICO_v1.5.md

## 5. Perfiles operativos

Esta sección define los **perfiles operativos**.
Los perfiles existen para **facilitar la operación**, no para imponer seguridad.

---

## 5.1 Principio base

- Un perfil **no es** un rol.
- Un perfil **no es** una entidad de seguridad dura.
- Un perfil **no se evalúa** en reglas Firebase.

Un perfil es solo un **paquete de capacidades recomendado**.

---

## 5.2 Propósito de los perfiles

Los perfiles sirven para:

- Configurar usuarios rápidamente.
- Reducir errores humanos al asignar capacidades.
- Representar funciones operativas comunes.
- Facilitar capacitación y reportes.

Los perfiles **no otorgan autoridad** por sí mismos.

---

## 5.3 Relación con capacidades

- Un perfil agrupa capacidades atómicas.
- Las capacidades siguen siendo:
  - explícitas
  - visibles
  - auditables
- Las capacidades pueden:
  - agregarse
  - removerse
  manualmente después de aplicar un perfil.

---

## 5.4 Perfiles base del sistema

### 5.4.1 Perfil Rondinero

Perfil enfocado en recorridos físicos y validación por puntos de control.

Capacidades típicas:
- `shift.open`
- `shift.close`
- `rondin.start`
- `rondin.recordCheckpoint`
- `rondin.finish`
- `qr.scan`
- `incident.create`
- `evidence.attach`

---

### 5.4.2 Perfil Guardia de Accesos

Perfil enfocado en control de entradas y salidas.

Capacidades típicas:
- `shift.open`
- `shift.close`
- `access.registerEntry`
- `access.registerExit`
- `vehicle.registerEntry`
- `vehicle.registerExit`
- `qr.scan`
- `evidence.attach`

---

### 5.4.3 Perfil Guardia General

Perfil operativo generalista.

Capacidades típicas:
- `shift.open`
- `shift.close`
- `checklist.submit`
- `incident.create`
- `qr.scan`
- `evidence.attach`

---

## 5.5 Personalización por empresa

- Una empresa puede:
  - usar perfiles base
  - clonar perfiles
  - crear perfiles propios
- Esto **no** requiere cambios en reglas.
- Esto **no** afecta a otras empresas.

---

## 5.6 Auditoría y perfiles

- La asignación de un perfil se audita.
- Los cambios manuales de capacidades se auditan.
- El perfil aplicado **no se confía** para ejecución.

---

## 5.7 Regla de cierre

> Los perfiles ayudan a operar.
> Las capacidades gobiernan.
> Las reglas nunca confían en perfiles.

Cualquier dependencia directa de perfiles
en seguridad invalida el sistema.
