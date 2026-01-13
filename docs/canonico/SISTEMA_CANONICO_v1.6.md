# SISTEMA_CANONICO_v1.6.md

## 6. Ciclo de vida de la empresa (alta, activación y pago)

Esta sección define cómo una empresa entra, opera y puede ser suspendida dentro del sistema.
Este flujo es **híbrido**: combina auto-registro, pago y validación de plataforma.

---

## 6.1 Principio rector

- El pago **no otorga permisos**.
- El pago **habilita estados y módulos**.
- La operación depende del **estado de la empresa**, no del cliente.

El backend es la autoridad final en todos los cambios de estado.

---

## 6.2 Estados de la empresa

Estados posibles:

- `pending_registration`
- `pending_payment`
- `pending_review`
- `active`
- `suspended`
- `deleted`

Reglas:
- Solo `active` permite operación.
- `suspended` permite solo lectura administrativa.
- `deleted` es irreversible.

---

## 6.3 Flujo de alta híbrido

### Paso 1: Registro inicial
- El cliente crea una cuenta administrativa.
- Se registra una empresa en estado `pending_payment`.
- No hay acceso operativo.

---

### Paso 2: Pago
- El cliente realiza el pago (ej. PayPal).
- El backend valida el evento de pago.
- El sistema **no** se activa automáticamente.

Resultado:
- Empresa pasa a `pending_review`.

---

### Paso 3: Revisión (plataforma)
- Superadmin valida:
  - legitimidad básica
  - plan contratado
  - módulos iniciales
- Puede aprobar o rechazar.

Resultado:
- Aprobado → `active`
- Rechazado → `suspended` o `deleted`

---

## 6.4 Activación de módulos

- Superadmin define:
  - módulos habilitados (techo)
- Administrador de la empresa:
  - activa o desactiva módulos dentro del techo
- Ningún módulo existe si no está activo.

---

## 6.5 Falta de pago

### Avisos
- Notificación automática al administrador.
- Avisos progresivos antes de suspensión.

### Suspensión
- Cambio de estado a `suspended`.
- Efectos:
  - Android no acepta sync.
  - No se aceptan comandos.
  - Solo lectura administrativa.

---

## 6.6 Reactivación

- Pago validado.
- Superadmin o sistema reactiva empresa.
- No se pierden datos.
- Se registra auditoría.

---

## 6.7 Auditoría

Se audita:
- Registro de empresa.
- Pago recibido.
- Cambio de estado.
- Activación / desactivación de módulos.
- Suspensión y reactivación.

Nada de esto es editable.

---

## 6.8 Regla de cierre

> El sistema vende **acceso controlado**,  
> no permisos ni confianza.

El pago habilita operación,
pero no relaja seguridad.
