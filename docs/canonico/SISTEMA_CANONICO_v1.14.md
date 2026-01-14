# SISTEMA_CANONICO_v1.14.md

## 14. Reglas Firebase (patrones)

Esta sección define los **patrones obligatorios** para reglas de seguridad.
No es sintaxis concreta, es el **modelo mental** que toda regla debe seguir.

---

## 14.1 Principio base

- **Deny by default** en todos los recursos.
- Nada se permite por rol.
- Nada se permite por UI.
- Todo se valida contra estado, módulo y capacidad.

---

## 14.2 Autenticación

- `request.auth` es obligatorio.
- Auth identifica, **no autoriza**.
- Usuarios suspendidos no pueden operar.
- Tokens nunca contienen permisos finales.

---

## 14.3 Aislamiento multiempresa

Para toda lectura o escritura:

- `resource.companyId == user.companyId`
- No existen lecturas cruzadas.
- No existen queries globales.

Si no hay `companyId` → deny.

---

## 14.4 Estado de la empresa

Antes de cualquier operación:

- Empresa debe existir.
- Empresa debe estar `active`.

Estados:
- `pending_*` → solo lectura administrativa.
- `suspended` → sin operación.
- `deleted` → sin acceso.

---

## 14.5 Módulos

- Cada módulo tiene un flag explícito.
- Si el módulo no está activo:
  - no hay lecturas
  - no hay escrituras
- No existen rutas latentes.

---

## 14.6 Capacidades

- Cada acción valida una capacidad explícita.
- No existen comodines.
- No se infieren capacidades por rol.

Ejemplo lógico:
- `hasCapability("incident.create")`

---

## 14.7 Turnos

Para operaciones diarias:

- Turno `open` obligatorio.
- Turno pertenece al usuario.
- Turno pertenece a la empresa.

Sin turno → deny.

---

## 14.8 Estados del recurso

Cada entidad define estados válidos.

Ejemplos:
- Incidente: `open → closed`
- Rondín: `started → finished`

Reglas:
- No se permiten regresiones.
- No se permiten saltos.

---

## 14.9 Escrituras directas vs comandos

- Firestore directo:
  - **solo lectura**
- Escrituras críticas:
  - **solo vía Cloud Functions**
- Reglas Firestore bloquean updates críticos.

---

## 14.10 Firebase Storage

- Rutas obligatorias por empresa.
- Validación cruzada con Firestore.
- Upload solo con capacidad válida.
- Nunca acceso público.

---

## 14.11 App Check

- App Check habilitado.
- Sin excepciones.
- Fallos de App Check → deny.

---

## 14.12 Auditoría

- Toda escritura crítica:
  - genera auditoría
  - en transacción
- Auditoría:
  - write-only
  - sin delete
  - sin update

---

## Regla de cierre

> Si una regla no puede explicarse
> en estos términos,
> la regla está mal diseñada.
