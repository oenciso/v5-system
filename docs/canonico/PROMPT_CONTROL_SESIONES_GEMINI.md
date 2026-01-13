Prompt para INICIAR una sesión (OBLIGATORIO)

Usa este prompt al inicio de cada sesión:

Lee completamente:

- DEV_EXECUTION_LOG.md
- RFC activo
- Documentación de producción relevante (/docs)
- Documentación canónica (/docs/canonico)

1. Identifica explícitamente:
   - fase activa
   - última sesión registrada
   - estado actual (en curso / bloqueado)
   - pendientes abiertos
   - bloqueos activos

2. Confirma desde dónde continuarás exactamente.
3. Enumera qué documentos gobiernan esta sesión.
4. Confirma que NO avanzarás de fase sin autorización explícita.

Si existe cualquier ambigüedad:
DETENTE y solicita aclaración.




Prompt para EJECUTAR una tarea o sección

Antes de iniciar cualquier trabajo:

Confirma que la tarea:

- pertenece a la fase activa del RFC
- no viola el Canon
- respeta MODELO_MENTAL_DEL_SISTEMA.md
- respeta INVARIANTES_DE_PRODUCCION.md

Indica explícitamente:
- qué vas a hacer
- qué NO vas a hacer
- qué documentos gobiernan esta tarea

Si detectas conflicto, vacío o contradicción:
REGÍSTRALO como bloqueo y DETENTE.



Prompt para CERRAR una sesión (OBLIGATORIO)

Al finalizar la sesión, siempre ejecutar:

Actualiza DEV_EXECUTION_LOG.md agregando una nueva entrada.

Incluye obligatoriamente:
- fecha
- fase activa
- tareas abordadas (con referencia al RFC)
- documentos que gobernaron la sesión
- qué quedó hecho
- qué quedó pendiente
- bloqueos detectados (con referencia documental)
- próximo paso recomendado (NO ejecutado)

No borres ni edites sesiones anteriores.