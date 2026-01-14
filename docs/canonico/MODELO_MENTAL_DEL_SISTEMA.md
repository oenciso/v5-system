# MODELO_MENTAL_DEL_SISTEMA.md
## Modelo Mental y Orden de Construcción del Sistema

Este documento define **cómo debe pensarse el sistema** antes de diseñar,
implementar o ejecutar cualquier componente.

No define reglas técnicas ni decisiones de arquitectura.
Define el **marco mental obligatorio** para no romper el sistema en producción.

Si existe conflicto con el Canon, **el Canon manda**.

---

## 1. Principios Mentales Fundamentales

- Intención ≠ Efecto  
- Comando ≠ Evento  
- Fallo ≠ Excepción  
- Seguridad precede a funcionalidad  
- El cliente es hostil por diseño  

Nada en el sistema debe asumirse como correcto solo porque “funciona”.

---

## 2. Conceptos Base

### Intención (Comando)
Solicitud declarativa de cambio.
Es inmutable y no garantiza efecto.

### Evaluación
Proceso autoritativo donde el backend valida:
- identidad
- estado
- reglas
- contexto

### Efecto (Evento)
Resultado aceptado y aplicado.
Solo existe si supera validación completa.

### Estado
Resultado persistente y auditable del sistema.

### Fallo
Resultado válido donde el efecto **no ocurre**.
No es excepción ni error inesperado.

---

## 3. Separación de Responsabilidades

- El cliente **declara** intención.
- El backend **decide**.
- El sistema **audita**.

Cualquier desviación rompe invariantes de producción.

---

## 4. Pensamiento Offline-First (acotado)

Offline **no significa autonomía**.
Significa:
- persistencia local de intención
- validación diferida
- rechazo explícito si ya no es válida

Nunca:
- autoridad local
- éxito anticipado

---

## 5. Orden Correcto de Construcción (Inmutable)

Este orden **no se negocia**:

1. Modelo mental
2. Invariantes de producción
3. Seguridad y auditoría
4. Contratos de datos
5. Infraestructura de comandos
6. UI / Experiencia
7. Optimización

Construir fuera de este orden genera deuda estructural.

---

## 6. Prohibiciones Mentales

- No “arreglar para que compile”
- No asumir happy path
- No adelantar fases
- No introducir lógica sin auditoría

---

## Regla Final

Este documento gobierna **cómo pensar**, no **qué implementar**.

Si alguien entiende el sistema distinto después de leerlo:
el documento falló y debe corregirse.

Si existe conflicto:
**el Canon manda**.

