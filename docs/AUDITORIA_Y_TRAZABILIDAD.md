# AUDITORIA_Y_TRAZABILIDAD.md
## Auditoría, Seguridad y Control Operativo

Este documento define cómo el sistema:
- se vuelve defendible,
- detecta abuso,
- y mantiene control en producción.

No describe implementación técnica.
Define **qué debe ser siempre observable**.

Si existe conflicto con el Canon, **el Canon manda**.

---

## 1. Principios de Auditoría

- Sin evidencia no hay evento válido.
- Todo efecto debe ser rastreable.
- Nada crítico se elimina.
- La auditoría es obligatoria, no opcional.

---

## 2. Evidencia e Inmutabilidad

Toda acción relevante debe producir:
- identificador único
- marca de tiempo
- actor responsable
- contexto de decisión

La evidencia:
- es inmutable
- es verificable
- no se sobrescribe

---

## 3. Correlación Intención → Efecto

El sistema debe permitir reconstruir:

1. Qué se intentó
2. Quién lo intentó
3. Bajo qué condiciones
4. Qué decidió el backend
5. Qué efecto ocurrió (o no)

Si no se puede reconstruir:
el diseño es inválido.

---

## 4. Seguridad Operativa

### 4.1 Principios
- Deny-by-default
- Backend autoritativo
- Cliente no confiable
- Separación identidad / capacidad

---

### 4.2 Control de Abuso

El sistema debe poder detectar y limitar:

- exceso de comandos
- repetición (replay)
- dispositivos comprometidos
- patrones anómalos

El control es:
- por rol
- por empresa
- por tipo de acción

---

### 4.3 Rate Limits Conceptuales

Los límites:
- no son opcionales
- no son globales
- no se aplican ciegamente

Siempre deben:
- degradar con claridad
- registrar eventos
- evitar bloqueos silenciosos

---

## 5. Revocación y Contención

El sistema debe permitir:

- revocar usuarios
- revocar dispositivos
- suspender empresas

La revocación:
- es inmediata
- es visible
- es auditable

---

## 6. Señales de Degradación

Antes de una falla grave, el sistema debe poder observar:

- colas creciendo
- rechazos incrementales
- intentos repetidos
- degradación progresiva

La observabilidad evita incidentes.

---

## Regla Final

Auditoría y seguridad **no son capas separadas**.
Son el mismo mecanismo visto desde distintos ángulos.

Si algo no puede auditarse:
no debe existir.

Si existe conflicto:
**el Canon manda**.

