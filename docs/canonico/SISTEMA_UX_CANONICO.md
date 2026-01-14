# SISTEMA_UX_CANONICO.md

## Autoridad del documento

Este documento define las reglas obligatorias de UX del sistema.
Aplica a **web y Android**.
No describe pantallas.
Describe **comportamiento, estados y contratos de interacción**.

Si una UI contradice este documento, la UI está mal diseñada.

---

## 1. Principios de UX para producción real

- El sistema no asume éxito inmediato.
- El backend siempre decide el estado final.
- El error humano es normal y esperado.
- La UX nunca se rompe por uso incorrecto.
- Nunca se ocultan errores.
- No se usan confirmaciones como parche de seguridad.
- El sistema es usable con mala conectividad.
- Consistencia sobre creatividad.

---

## 2. Patrones de interacción

### 2.1 Acciones

- Toda acción genera una intención.
- La intención entra en estado `pending`.
- El resultado viene del backend.
- No hay spinners infinitos.
- El botón puede tocarse varias veces sin romper nada.

Estados visibles:
- pending
- accepted
- rejected

---

### 2.2 Formularios

- Validación local + backend.
- Envío único por comando.
- Guardado progresivo cuando aplica.
- Reintentos permitidos.
- El backend puede rechazar aunque la UI valide.

---

### 2.3 Listados

- Los datos pueden estar desactualizados.
- Siempre existe acción de refresco.
- Se indica origen del dato:
  - local
  - servidor

---

### 2.4 Offline

- El estado offline es visible.
- Las acciones offline quedan marcadas como pendientes.
- El usuario sabe qué falta sincronizar.

---

## 3. Componentes canónicos

Componentes obligatorios y reutilizables:

- Botón primario
- Botón secundario
- Botón peligro
- Indicador de estado (Pending / Accepted / Rejected)
- Estado de entidad (Active / Closed / Suspended)
- Error bloqueante
- Error no bloqueante
- Placeholder offline
- Empty state estándar

Regla:
No se crean componentes “rápidos” por pantalla.

---

## 4. Estados y feedback

- Todo cambio de estado es visible.
- No hay estados implícitos.
- El usuario siempre sabe:
  - qué pasó
  - qué está pendiente
  - qué falló

Nunca:
- confirmar éxito antes del backend
- ocultar rechazo

---

## 5. Tokens de diseño (congelados)

Tokens semánticos, no decorativos:

- Verde: acción aceptada
- Gris: pendiente
- Amarillo: advertencia
- Rojo: error o acción irreversible

Otros tokens:
- Tipografía consistente
- Espaciado uniforme
- Breakpoints definidos

Los tokens se definen una vez y no se reinterpretan.

---

## 6. Reglas de consistencia

- Un mismo patrón se comporta igual en todo el sistema.
- Web y Android comparten semántica de estados.
- Las diferencias son solo de plataforma, no de lógica.
- La UX no compensa fallos de backend.

---

## Regla final

> La UX no existe para impresionar,
> existe para que el sistema sobreviva en producción real.
