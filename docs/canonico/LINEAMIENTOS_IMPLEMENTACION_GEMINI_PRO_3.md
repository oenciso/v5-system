# LINEAMIENTOS_IMPLEMENTACION_GEMINI_PRO_3.md

## Autoridad

Este documento traduce **SISTEMA_CANONICO_FINAL.md** a instrucciones ejecutables.
Gemini Pro 3 **no debe interpretar, inferir ni simplificar**.
Debe implementar exactamente lo aquí descrito.

Si hay conflicto entre código y estos lineamientos:
→ el código está mal.

---

## 1. Regla absoluta de trabajo

- Implementar **solo** lo documentado.
- No crear shortcuts.
- No asumir “uso correcto”.
- No optimizar antes de cumplir invariantes.
- Fallar seguro > aceptar inválido.

---

## 2. Forma de trabajar (obligatoria)

Para **cada feature**:

1. Identificar:
   - módulo
   - capacidades
   - comandos
2. Verificar:
   - empresa activa
   - módulo activo
   - capacidad explícita
3. Implementar:
   - backend primero
   - cliente después
4. Validar:
   - idempotencia
   - auditoría
   - rechazo seguro

Si no puede mapearse a esto → no se implementa.

---

## 3. Backend (prioridad máxima)

### 3.1 Cloud Functions

- Toda escritura crítica es una Cloud Function.
- No usar Firestore directo para mutaciones.
- Cada función:
  - recibe un comando
  - valida TODO
  - ejecuta en transacción
  - escribe auditoría
  - devuelve resultado tipado

Nunca:
- lógica parcial
- side-effects fuera de transacción

---

### 3.2 Validaciones obligatorias (orden fijo)

1. Auth válida.
2. Usuario activo.
3. Empresa activa.
4. Módulo activo.
5. Capacidad explícita.
6. Estado del recurso.
7. Secuencia válida.
8. Idempotencia (`commandId`).

Falla cualquiera → reject.

---

### 3.3 Idempotencia

- Tabla `command_receipt`.
- `commandId` único.
- Reintentos devuelven mismo resultado.
- No duplicar efectos.

---

### 3.4 Auditoría

- Siempre se escribe.
- Incluye:
  - actor
  - acción
  - resultado
  - origen
- Nunca editable.
- Nunca opcional.

---

## 4. Modelo de datos

- Cada documento incluye `companyId`.
- Estados explícitos.
- No deletes lógicos silenciosos.
- No updates genéricos.
- Versionado obligatorio.

---

## 5. Reglas Firebase

- Deny by default.
- Aislamiento por `companyId`.
- Firestore:
  - lectura directa permitida
  - escritura crítica bloqueada
- Storage:
  - rutas por empresa
  - sin acceso público
- App Check obligatorio.

---

## 6. Cliente Web (administración)

- Nunca decide permisos.
- Nunca ejecuta lógica crítica.
- Usa:
  - Server Actions
  - esquemas Zod
- UI refleja:
  - módulos activos
  - capacidades efectivas

Errores deben:
- ser claros
- no filtrar información sensible

---

## 7. Cliente Android (Capacitor)

### 7.1 Offline-first

- Toda acción genera comando local.
- SQLite obligatorio.
- Cola persistente.
- Reintentos seguros.

---

### 7.2 Sync

- Enviar comandos en orden.
- Un comando a la vez.
- Esperar respuesta backend.
- Marcar accepted / rejected.

Nunca:
- asumir éxito
- mutar estado final local

---

### 7.3 Evidencias

- Captura → compresión → hash → upload Storage.
- Sin upload → no comando.
- Nunca Base64.

---

## 8. UX defensiva

- Botones pueden tocarse múltiples veces.
- Formularios pueden enviarse incompletos.
- Usuario puede cerrar la app.

El sistema:
- no se rompe
- no duplica estado
- no pierde integridad

---

## 9. Builds y release

- Build reproducible.
- Blindaje Android obligatorio.
- Fallar build ante imports prohibidos.
- No debug en producción.

---

## 10. Qué NO hacer (prohibido)

- Confiar en cliente.
- Mezclar roles con permisos.
- Escribir directo a Firestore desde app.
- Crear lógica “temporal”.
- Bypassear auditoría.
- Implementar features no documentadas.

---

## 11. UX / UI (regla obligatoria)

- Toda UI debe cumplir SISTEMA_UX_CANONICO.md.
- No se inventan patrones por pantalla.
- No se asume éxito inmediato.
- No se ocultan estados pending / rejected.
- Si hay duda → no implementar.

---

## Regla final

> Gemini Pro 3 no construye features.
> Construye **un sistema que sobrevive producción real**.

Si algo no está claro,
**no se asume**.
Se detiene la implementación.
