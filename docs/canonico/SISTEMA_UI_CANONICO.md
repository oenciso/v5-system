# SISTEMA_UI_CANONICO

## 1. Autoridad del documento
Este documento es **canónico y vinculante** para todo el sistema.

Cualquier UI (Web o Android) **debe cumplir estas reglas**.
Si existe conflicto entre implementación y este documento, **este documento manda**.

No describe pantallas.
Describe **reglas, contratos y componentes obligatorios**.

---

## 2. Principios UX (reglas duras)

1. El sistema **no asume éxito inmediato**.
2. Toda acción puede fallar.
3. El usuario siempre ve el **estado real**:
   - pending
   - accepted
   - rejected
4. Nunca se ocultan errores.
5. Nunca se pide confirmación para compensar validación débil de backend.
6. El sistema debe ser usable con **conectividad pobre o nula**.
7. La UI **no decide negocio**.

---

## 3. Paleta semántica (tokens)

> Los colores son **semánticos**, no decorativos.

### 3.1 Colores base (Web)

- Navigation / Sidebar: `#0B1C2D` (Azul marino oscuro)
- Background principal: `#F8FAFC`
- Card background: `#FFFFFF`

### 3.2 Estados

- **Accepted / Success**: Verde
- **Pending**: Amarillo
- **Rejected / Error**: Rojo
- **Disabled**: Gris

Nunca se usan colores fuera de estos significados.

---

## 4. Layout Web Canónico

### 4.1 Estructura

```
[ Sidebar fija ] [ Header superior ]
                 [ PageHeader ]
                 [ Cards / Tables ]
```

### 4.2 Reglas

- Sidebar siempre visible.
- Header sin lógica de negocio.
- El contenido siempre vive dentro de Cards o Tables.
- No contenido flotante.

---

## 5. Uso de shadcn/ui

### 5.1 Rol de shadcn

shadcn/ui se usa **solo como base técnica**.

Nunca como sistema de diseño completo.

### 5.2 Componentes permitidos (base)

- Button
- Input
- Select
- Checkbox
- Badge
- Table
- Card
- Alert

### 5.3 Componentes prohibidos directamente en páginas

- Dialog
- Toast
- Dropdown
- Sheet

Estos deben envolverse en componentes canónicos propios.

---

## 6. Componentes Canónicos Obligatorios

Las páginas **NO pueden usar shadcn directo**.

Componentes obligatorios:

- `PrimaryButton`
- `SecondaryButton`
- `DangerButton`
- `StatusBadge` (accepted | pending | rejected)
- `OfflineBanner`
- `ErrorInline`
- `EmptyState`
- `PageHeader`
- `SidebarNavItem`

Si un componente no existe aquí, **no se usa en páginas**.

---

## 7. Estados y feedback

### 7.1 Acciones

- Toda acción pasa por:
  - idle → pending → accepted / rejected

- Nunca hay spinners infinitos.
- El backend confirma el resultado.

### 7.2 Errores

- Los errores se muestran **por código**, no por texto libre.
- El texto es informativo, no técnico.

---

## 8. Reglas Android

Android **no replica el layout web**.

Comparte:
- Estados
- Colores semánticos
- Comportamiento

No comparte:
- Sidebar
- Densidad
- Layout

Android se define en documento separado.

---

## 9. Prohibiciones explícitas

- No estilos rápidos por urgencia.
- No lógica de negocio en UI.
- No uso directo de shadcn en páginas.
- No componentes sin estado explícito.

---

## 10. Cierre

Este documento existe para:

- Evitar divergencia visual
- Evitar UX frágil
- Permitir cambios futuros baratos

Cualquier excepción debe documentarse y aprobarse explícitamente.

