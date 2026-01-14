# DECISIONS.md
## Registro de Decisiones y Gobernanza del Sistema

Este documento define cómo se toman, validan y registran las decisiones dentro del proyecto.
Su objetivo es prevenir decisiones implícitas, evitar desviaciones del Canon y mantener control estricto del sistema a lo largo del tiempo.

---

## 1. Autoridad Máxima (Fuente de Verdad)

La única autoridad absoluta para estándares técnicos, arquitectura, UX, seguridad y procesos es:

/docs/canonico

- Ningún otro documento puede contradecir el Canon.
- Ninguna implementación puede interpretar el Canon libremente.
- Si existe conflicto entre documentos, el Canon prevalece siempre.

Este archivo no define reglas nuevas: define cómo obedecer las existentes.

---

## 2. Roles y Responsabilidades

### Arquitecto (Senior Staff / Arquitecto de Sistema)

Responsabilidades exclusivas:
- Proponer y validar diseños de sistema.
- Interpretar el Canon cuando sea necesario sin modificarlo.
- Detectar riesgos, inconsistencias y deuda conceptual.
- Autorizar explícitamente cualquier avance no cubierto por el Canon.

Limitaciones:
- No ejecuta código.
- No implementa soluciones técnicas.
- No avanza fases sin aprobación humana explícita.

---

### Ejecutor (Programador / IA / Implementador)

Responsabilidades:
- Implementar únicamente lo que ha sido autorizado.
- Seguir estrictamente los documentos vigentes.
- Detenerse ante cualquier ambigüedad.

Prohibiciones:
- No tomar decisiones arquitectónicas.
- No arreglar para que funcione.
- No asumir comportamientos implícitos.
- No cerrar fases ni tareas por iniciativa propia.

---

## 3. Regla de Progreso Explícito

El progreso nunca es implícito.

- Nada se considera aprobado porque ya se hizo.
- Nada se considera correcto porque funciona.
- Toda decisión relevante debe estar documentada, referenciada y aceptada explícitamente.

---

## 4. Gestión de Lagunas en el Canon

Cuando se detecta una situación no cubierta explícitamente por la documentación canónica:

1. Marcar como Pendiente  
   - Detener la implementación relacionada.
   - Registrar la laguna en TECH_DECISIONS_PENDING.md.

2. Exponer Opciones  
   - Documentar opciones posibles.
   - Explicar riesgos, impactos y trade-offs.
   - Referenciar qué partes del Canon se ven afectadas.

3. Esperar Confirmación  
   - No avanzar.
   - No implementar temporalmente.
   - No suponer decisiones.

Solo el Arquitecto puede autorizar una opción o indicar que el Canon debe extenderse.

---

## 5. Decisiones Resueltas por el Canon

Si una decisión pendiente ya está definida en el Canon:

- No se debate.
- No se reabre.
- Se marca explícitamente como:

RESUELTA POR CANON  
Referencia: Documento / Sección

---

## 6. Criterio de Aceptación de Decisiones

Una decisión es válida solo si:
- Está alineada con el Canon.
- Está documentada.
- Tiene alcance claro.
- No introduce ambigüedad futura.
- No rompe invariantes de producción.

Funciona no es un criterio de aceptación.

---

## 7. Advertencia Final

Bajo ninguna circunstancia se deben:
- asumir funcionalidades,
- inventar estándares,
- omitir validaciones,
- o avanzar para desbloquear tareas.

Cualquier atajo hoy es deuda crítica mañana.

---

## 8. Regla de Cierre

Este documento gobierna el cómo se decide, no qué se decide.
Si existe conflicto entre este documento y el Canon, el Canon manda.