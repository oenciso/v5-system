# SISTEMA_CANONICO_v1.22.md

## 20. Glosario

Este glosario define **términos exactos** usados en el sistema.
Las palabras aquí tienen **significado cerrado**.
No son interpretables libremente.

---

### Acción
Intento de cambio de estado iniciado por un usuario o sistema.
Solo existe si se convierte en un comando válido.

---

### Auditoría
Registro inmutable de acciones relevantes del sistema.
Siempre generado por backend.
Nunca editable ni eliminable.

---

### Backend
Conjunto de servicios que actúan como autoridad final.
Valida, decide y persiste estados reales.

---

### Capacidad
Permiso atómico que habilita intentar una acción.
No garantiza éxito.
Siempre evaluada en backend.

---

### Checkpoint / Punto de control
Ubicación física identificada mediante un código QR.
Pertenece a una empresa.
Puede estar activa o deshabilitada.

---

### Checklist
Verificación estructurada ligada a un turno.
Se envía una sola vez.
No se edita después de aceptada.

---

### Cliente
Aplicación web o Android que ejecuta intenciones.
Nunca es fuente de verdad.

---

### Comando
Intención explícita enviada al backend para cambiar estado.
Inmutable, idempotente y auditable.

---

### Empresa
Unidad de aislamiento del sistema.
Todo dato pertenece a exactamente una empresa.

---

### Evidencia
Archivo verificable (ej. foto) que respalda una acción.
Vive en Storage.
Siempre ligada a un evento real.

---

### Módulo
Unidad funcional del sistema.
Si un módulo está desactivado, la funcionalidad no existe.

---

### Offline-first
Capacidad de operar sin conexión.
No implica confianza en el cliente.

---

### Perfil operativo
Paquete recomendado de capacidades.
No es una entidad de seguridad.

---

### Rol
Nivel jerárquico que define límites de delegación.
No habilita acciones operativas por sí mismo.

---

### Rondín
Actividad operativa de recorrido.
Puede ser libre o con ruta asignada.

---

### Turno
Periodo activo de operación de un usuario.
Requisito para la mayoría de acciones operativas.

---

### Usuario
Persona autenticada que interactúa con el sistema.
Pertenece a una sola empresa.

---

### Regla de cierre

> Si un término no está en este glosario,
> no debe usarse para definir comportamiento del sistema.
