# SISTEMA_CANONICO_v1.4.md

## 4. Roles y jerarquía

Esta sección define los **roles duros** del sistema.
Los roles existen para **ordenar autoridad y delegación**, no para habilitar funcionalidades.

---

## 4.1 Principio rector

- Los roles **no** habilitan acciones operativas.
- Los roles **sí** limitan qué se puede delegar.
- Ningún rol otorga permisos implícitos.

Las acciones reales se habilitan por **capacidades** y **módulos**.

---

## 4.2 Lista de roles duros

### 4.2.1 Superadmin (nivel 100)

**Ámbito**
- Plataforma completa (todas las empresas).

**Responsabilidades**
- Crear y eliminar empresas.
- Activar módulos para una empresa (techo funcional).
- Suspender o eliminar empresas.
- Definir límites máximos del sistema.

**Restricciones**
- No opera flujos diarios.
- No ejecuta operación en Android.

---

### 4.2.2 Administrador (nivel 80)

**Ámbito**
- Una sola empresa cliente.

**Responsabilidades**
- Administrar usuarios de su empresa.
- Asignar roles inferiores y capacidades dentro del techo.
- Activar o desactivar módulos **ya habilitados** por superadmin.
- Configurar operación interna (turnos, zonas, puntos).

**Restricciones**
- No puede ver ni afectar otras empresas.
- No puede habilitar módulos fuera del techo.
- No puede asignar capacidades que no posee.

---

### 4.2.3 Supervisor (nivel 70)

**Ámbito**
- Una sola empresa cliente.

**Responsabilidades**
- Supervisar operación.
- Cerrar o validar operaciones cuando esté permitido.
- Ver información asignada o de su ámbito.

**Restricciones**
- No administra módulos.
- No crea ni elimina usuarios.
- No escala permisos.

---

### 4.2.4 Guardia (nivel 50)

**Ámbito**
- Operación diaria en campo.

**Responsabilidades**
- Ejecutar acciones operativas asignadas.
- Registrar evidencias.
- Operar bajo turno activo.

**Restricciones**
- No administra usuarios.
- No administra módulos.
- No ve datos fuera de su asignación.
- No decide estados finales.

---

## 4.3 Jerarquía y delegación

Reglas duras:

- Un rol **nunca** puede asignar:
  - un rol superior al propio
  - capacidades que no posee
- La delegación es **descendente** y **acotada**.
- Toda asignación genera auditoría.

---

## 4.4 Relación rol vs capacidades

- El rol define **hasta dónde puede delegar**.
- La capacidad define **qué puede ejecutar**.
- El módulo define **si la funcionalidad existe**.

Ejemplo:
Un Guardia con la capacidad correcta puede operar un módulo,
pero no puede habilitarlo ni asignarlo.

---

## 4.5 Qué NO son los roles

Los roles NO son:
- presets de UI
- grupos de permisos
- features
- atajos de seguridad

Usarlos como tal rompe el modelo.

---

## Regla de cierre

> Roles ordenan poder.
> Capacidades permiten acciones.
> Módulos definen existencia.

Mezclar estos conceptos invalida el diseño.
