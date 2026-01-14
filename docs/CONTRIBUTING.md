# Guía de Contribución y Commits

Este documento establece las normas básicas de disciplina de versiones para el proyecto. El objetivo es mantener un historial limpio y legible sin depender de automatizaciones complejas.

## 1. Identidad
Antes de realizar cualquier commit, verifica que tu identidad sea correcta. Esto asegura la trazabilidad.

```bash
git config user.name "Tu Nombre"
git config user.email "tu@email.com"
```

## 2. Convención de Mensajes
Utilizamos una convención simplificada basada en "Conventional Commits".

**Estructura:**
`<tipo>: <descripción breve en imperativo>`

**Tipos permitidos:**
- `feat`: Una nueva funcionalidad.
- `fix`: Una corrección de error.
- `docs`: Cambios solo en documentación.
- `chore`: Tareas de mantenimiento, configuración de build, actualizaciones de paquetes (sin cambios en código de producción).
- `refactor`: Cambios de código que no arreglan bugs ni añaden funcionalidades (limpieza).

**Reglas de estilo:**
- Usar **minúsculas** para el tipo y el inicio de la descripción.
- Usar **modo imperativo** ("agregar" en lugar de "agregado" o "agregando").
- **Sin punto final** en la primera línea.
- Mantener la línea bajo 72 caracteres si es posible.

### Ejemplos Válidos vs Inválidos

**✅ Válidos**
- `feat: agregar validación en formulario de login`
- `fix: corregir error de cálculo en totales`
- `docs: actualizar readme con pasos de instalación`
- `chore: ignorar carpeta de logs`

**❌ Inválidos**
- `Agregue validacion` (Falta el tipo, verbo en pasado)
- `feat: Login funcionando.` (Mayúscula inicial, punto final)
- `fix bug` (Formato incorrecto)
- `avance` (No descriptivo)

## 3. ¿Cuándo hacer Commit?
La disciplina es personal, no forzada por herramientas.

- **Atomicidad**: Un commit debe contener cambios relacionados con una sola tarea lógica. Evita mezclar un `fix` de estilo con un `feat` de base de datos.
- **Frecuencia**: Haz commits a menudo. No esperes a terminar todo el módulo.
- **Estado**: Intenta (siempre que sea posible) que el código compile o no rompa la aplicación antes de hacer commit.
