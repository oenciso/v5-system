# SISTEMA_CANONICO_v1.13.md

## 13. Auditoría

Esta sección define el sistema de **auditoría inmutable**.
La auditoría no es un log de depuración.
Es un **registro legal y operativo**.

La auditoría existe porque el sistema
no confía en que todo salga bien.

---

## 13.1 Principios

- Toda acción sensible genera auditoría.
- La auditoría es **inmutable**.
- No existe edición ni eliminación.
- El timestamp es siempre del servidor.
- La auditoría es independiente del cliente.

---

## 13.2 Qué se audita (obligatorio)

Se audita como mínimo:

- Ejecución de comandos (accepted / rejected).
- Cambios de estado de empresa.
- Activación / desactivación de módulos.
- Asignación de roles, capacidades y perfiles.
- Apertura y cierre de turnos.
- Creación y cierre de incidentes.
- Inicio y finalización de rondines.
- Envío de checklists.
- Captura y asociación de evidencias.
- Escaneos de QR válidos y rechazados.
- Fallos de validación relevantes.

---

## 13.3 Qué NO se audita

No se audita:

- Lecturas simples sin impacto.
- Errores de UI locales.
- Reintentos automáticos sin efecto.
- Eventos puramente visuales.

La auditoría no es ruido.

---

## 13.4 Estructura del evento de auditoría

Campos mínimos:

- `id`
- `companyId`
- `actorId`
- `action`
- `target`
- `result` (accepted | rejected)
- `origin` (android | web | system)
- `serverTimestamp`

Campos opcionales:
- `reason` (para rechazos)
- `metadata` (limitado y controlado)

---

## 13.5 Reglas de escritura

- Solo backend escribe auditoría.
- Siempre en transacción con el comando.
- Nunca se escribe desde el cliente.
- Nunca se corrige.

---

## 13.6 Retención

- La auditoría **no expira por defecto**.
- Cualquier política de retención:
  - es explícita
  - es por empresa
  - se documenta
- La eliminación masiva no es automática.

---

## 13.7 Acceso a auditoría

- Visible solo para:
  - Superadmin
  - Administrador autorizado
- Acceso siempre filtrado por empresa.
- Nunca se expone auditoría de otras empresas.

---

## 13.8 Uso operativo y legal

La auditoría sirve para:

- Resolución de conflictos.
- Validación contractual.
- Análisis forense.
- Soporte técnico.
- Evidencia ante terceros.

---

## Regla de cierre

> Si una acción no deja rastro,
> no es una acción válida del sistema.
