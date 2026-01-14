# RFC-0_PLAN_EJECUCION_POR_FASES.md

## RFC-0 — Plan de ejecución por fases

Este documento define **el orden exacto** en el que se implementa el sistema.
No es una lista de tareas.
Es una **estrategia para llegar a producción sin romper invariantes**.

Si una fase no está cerrada, la siguiente no comienza.

---

## Principio rector

> Primero seguridad y control.
> Luego operación mínima.
> Después expansión.

Nunca al revés.

---

## Fase 0 — Preparación (obligatoria)

**Objetivo**
Dejar el entorno listo para construir sin deuda invisible.

**Entregables**
- Repositorio creado.
- Documentos canónicos versionados en el repo.
- `LINEAMIENTOS_IMPLEMENTACION_GEMINI_PRO_3.md` presente.
- `CHECKLIST_REVISION_PR_GEMINI_PRO_3.md` integrada como template.
- `SISTEMA_UX_CANONICO.md` versionado y aprobado.
- Tokens y patrones definidos antes de pantallas.
- CI configurado (lint, typecheck, tests mínimos).
- Pipeline que **falla** ante violaciones.

**Criterio de cierre**
- No se puede hacer merge sin checklist completa.

---

## Fase 1 — Núcleo de seguridad y control

**Objetivo**
Que el sistema pueda existir sin operar todavía.

**Alcance**
- Firebase Auth.
- Modelo empresa / usuario.
- Estados de empresa.
- Roles duros.
- Capacidades base.
- Auditoría básica.
- App Check activo.

**Entregables**
- Empresas pueden crearse y suspenderse.
- Usuarios existen y están aislados por empresa.
- Auditoría registra cambios de estado.
- Reglas Firebase deny-by-default funcionando.

**Criterio de cierre**
- No existe ninguna escritura crítica desde cliente.
- No hay lectura cruzada entre empresas.

---

## Fase 2 — Infraestructura de comandos

**Objetivo**
Garantizar que **todas las mutaciones** pasan por comandos.

**Alcance**
- Infraestructura de Cloud Functions.
- Contrato de comando.
- Tabla de idempotencia.
- Rechazos tipados.
- Auditoría integrada.

**Entregables**
- Comando de prueba (ej. `shift.open`).
- Idempotencia comprobada.
- Reintentos seguros.

**Criterio de cierre**
- Duplicar un comando no duplica efectos.
- Rechazos no corrompen estado.

---

## Fase 3 — Operación mínima (Android)

**Objetivo**
Primer flujo operativo real, aunque limitado.

**Alcance**
- App Android (Capacitor).
- Login.
- Turno (open / close).
- Cola offline SQLite.
- Sync básico.

**Entregables**
- Turno se abre offline.
- Turno se sincroniza online.
- Auditoría registra todo.

**Criterio de cierre**
- Apagar red no rompe la app.
- Reintentos no duplican turnos.

---

## Fase 4 — Evidencias

**Objetivo**
Capturar y validar evidencia real.

**Alcance**
- Cámara.
- Compresión.
- Storage.
- Hash.
- Asociación a evento.

**Entregables**
- Evidencia ligada a turno o incidente.
- Evidencia rechazada si no existe evento.
- Auditoría de evidencia.

**Criterio de cierre**
- No existe evidencia huérfana.
- No existe Base64 en Firestore.

---

## Fase 5 — QR y puntos de control

**Objetivo**
Anclar operación a realidad física.

**Alcance**
- CRUD de checkpoints.
- Generación de QR.
- Escaneo QR.
- Validación backend.

**Entregables**
- QR por empresa.
- Escaneo válido y rechazado.
- Auditoría de escaneos.

**Criterio de cierre**
- QR de otra empresa no funciona.
- Escaneos fuera de turno se rechazan.

---

## Fase 6 — Rondines

**Objetivo**
Operación estructurada de recorridos.

**Alcance**
- Modo free.
- Modo routed.
- Validación de secuencia.
- Reglas por modo.

**Entregables**
- Rondín completo.
- Rechazo de secuencia inválida.
- Auditoría completa.

**Criterio de cierre**
- No se puede “saltar” pasos.
- Cambiar modo no rompe historial.

---

## Fase 7 — Checklists

**Objetivo**
Verificación estructurada.

**Alcance**
- Templates.
- Asignación.
- Envío único.
- Validación backend.

**Entregables**
- Checklist enviado una vez.
- Rechazo de duplicados.
- Auditoría.

**Criterio de cierre**
- No se puede editar un checklist aceptado.

---

## Fase 8 — Accesos y control vehicular

**Objetivo**
Expandir operación sin tocar núcleo.

**Alcance**
- Entradas / salidas.
- Secuencia válida.
- Evidencia opcional.

**Entregables**
- Flujo completo.
- Rechazos seguros.
- Auditoría.

**Criterio de cierre**
- Secuencias inválidas no se aceptan.

---

## Fase 9 — Administración avanzada

**Objetivo**
Cerrar ciclo comercial y operativo.

**Alcance**
- Activación de módulos.
- Pago (integración).
- Suspensión automática.
- Reportes.

**Entregables**
- Empresa se activa por pago.
- Falta de pago suspende operación.
- Auditoría contractual.

**Criterio de cierre**
- No hay bypass comercial.

---

## Fase 10 — Endurecimiento y revisión

**Objetivo**
Preparar para producción real.

**Alcance**
- Testing de reglas.
- Testing offline.
- Ataques simulados.
- Revisión de checklist completa.

**Entregables**
- Issues críticos cerrados.
- Documentación actualizada.
- Release candidato.

---

## Regla final

> Si una fase se acelera,
> el sistema pagará la deuda después.

El orden es parte del diseño.
