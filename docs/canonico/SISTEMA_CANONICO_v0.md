# SISTEMA_CANONICO_v0.md

## Prefacio – Autoridad del documento

Este documento define **la verdad absoluta del sistema**.
No es una guía.
No es una sugerencia.
No es documentación decorativa.

Es el **contrato técnico, operativo y de seguridad** que gobierna todas las decisiones del sistema.

---

## Autoridad y precedencia

- Este documento tiene **precedencia total** sobre:
  - código
  - implementaciones
  - decisiones tácticas
  - optimizaciones
- Si el código contradice este documento, **el código está mal**.
- Ninguna urgencia justifica violar este documento.

---

## Enfoque de producción real

Este sistema se diseña **exclusivamente para producción real**.

Eso implica asumir que:

- Los usuarios cometen errores.
- Los usuarios se equivocan bajo presión.
- Los usuarios actúan de forma impredecible.
- Algunos usuarios intentarán abusar del sistema.
- Los dispositivos fallan.
- Las redes fallan.
- Las sincronizaciones se interrumpen.
- Los flujos se ejecutan fuera de orden.

El sistema **no debe romperse** bajo estas condiciones.

---

## Supuestos explícitos (no negociables)

El sistema **no asume**:

- Usuarios capacitados perfectamente.
- Uso correcto de la UI.
- Conectividad constante.
- Un solo intento por acción.
- Que el cliente siga las reglas.
- Que el error humano sea raro.

El sistema **sí asume**:

- Errores frecuentes.
- Reintentos.
- Duplicados.
- Estados intermedios.
- Inputs inválidos.
- Contexto desfasado.

Y debe comportarse de forma segura en todos los casos.

---

## Filosofía de diseño

- La seguridad es prioritaria sobre la comodidad.
- Bloquear una acción válida es preferible a aceptar una inválida.
- Fallar de forma segura es obligatorio.
- La integridad del sistema está por encima de la experiencia individual.

No se diseñan “caminos felices” sin contemplar fallos.

---

## Rol del documento en el desarrollo

- Toda feature debe:
  - mapearse a este documento
  - respetar sus invariantes
  - extenderlo explícitamente si es necesario
- Ninguna feature se implementa “rápido” sin documentación.
- Cambios requieren:
  - versión nueva del documento
  - justificación explícita

---

## Regla de cierre

> Este documento existe porque los sistemas reales
> fallan cuando se confía en supuestos irreales.

Si una decisión no resiste este prefacio,
no pertenece al sistema.
