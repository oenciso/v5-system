# SISTEMA_CANONICO_v1.2.md


## 2. Invariantes no negociables

Esta sección define las reglas absolutas del sistema.
No son recomendaciones.
No son configurables.
No se rompen por conveniencia técnica ni comercial.

Si una implementación viola un invariante, la implementación es incorrecta.

El sistema debe resistir uso incorrecto
sin corromper datos ni romper seguridad.

---

## 2.1 Multiempresa (aislamiento total)

- El sistema es **multiempresa (multi-tenant)**.
- Cada empresa es una frontera de seguridad absoluta.
- Los datos de una empresa:
  - no son visibles
  - no son inferibles
  - no son accesibles
  por usuarios de otra empresa.

Aplica a:
- Firestore
- Storage
- Auditoría
- Operación offline
- Reportes

No existen excepciones.

---

## 2.2 Backend como autoridad única

- El backend es la única fuente de verdad.
- El cliente nunca decide estados finales.
- Toda acción debe ser validada en backend.
- El backend puede rechazar acciones válidas en UI.

Preferimos bloquear una acción válida
a aceptar una inválida.

---

## 2.3 Deny by default

- Toda operación está prohibida por defecto.
- Solo se permite lo explícitamente autorizado.
- No existen permisos implícitos.
- No existen accesos “por rol”.

---

## 2.4 Separación estricta de conceptos

Estos conceptos **nunca** se mezclan:

- Rol (jerarquía)
- Capacidades (acciones)
- Módulos (existencia de funcionalidad)

Un rol no habilita features.
Un módulo no otorga permisos.
Una capacidad no define jerarquía.

---

## 2.5 Roles mínimos y estables

Roles duros del sistema:

- Superadmin
- Administrador
- Supervisor
- Guardia

Los roles:
- son pocos
- cambian raramente
- limitan delegación

Nunca se crean roles por feature.

---

## 2.6 Capacidades explícitas

- Toda acción requiere una capacidad explícita.
- Las capacidades son atómicas.
- No existen comodines.
- Las capacidades se evalúan en backend.

---

## 2.7 Módulos como límites fuertes

- Un módulo apagado **no existe**.
- No hay rutas latentes.
- No hay lógica ejecutable.
- No hay escrituras permitidas.

La UI refleja el estado del módulo.
No lo define.

---

## 2.8 Offline-first limitado a Android

- Solo Android es offline-first.
- Web siempre es online.
- Offline no relaja reglas.
- Backend siempre valida al sincronizar.

---

## 2.9 Auditoría obligatoria

- Toda acción sensible genera auditoría.
- La auditoría es inmutable.
- No se edita.
- No se elimina.
- Incluye actor, acción, origen y timestamp servidor.

---

## 2.10 Evidencia separada y verificable

- Evidencias viven en Storage.
- Firestore solo guarda referencias.
- No se usa Base64.
- Toda evidencia tiene hash.
- No existen evidencias huérfanas.

---

## 2.11 Superficie mínima de ataque

- Android solo expone operación.
- Web no expone rutas latentes.
- El build falla si se detecta código prohibido.
- El APK modificado no debe funcionar.

---

## 2.12 Evolución controlada

- Las features se agregan por adición.
- No se rompen contratos existentes.
- Cambios incompatibles requieren versionado explícito.
- No existen migraciones silenciosas.

---

## Regla de cierre

> Estos invariantes definen el sistema.
> Cualquier atajo que los viole
> introduce deuda o riesgo.

No se aceptan excepciones.
