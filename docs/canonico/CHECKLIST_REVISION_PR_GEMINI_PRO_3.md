# CHECKLIST_REVISION_PR_GEMINI_PRO_3.md

## Propósito

Esta checklist se usa para **revisar Pull Requests** contra:
- `SISTEMA_CANONICO_FINAL.md`
- `LINEAMIENTOS_IMPLEMENTACION_GEMINI_PRO_3.md`

Si algún punto falla → **PR no se aprueba**.

---

## 1. Validación general (obligatoria)

- [ ] El PR referencia explícitamente el módulo afectado.
- [ ] El PR referencia las capacidades involucradas.
- [ ] El PR referencia los comandos de dominio afectados.
- [ ] No introduce funcionalidades no documentadas.
- [ ] No contradice el documento canónico.

---

## 2. Seguridad y producción real

- [ ] No confía en comportamiento correcto del usuario.
- [ ] Tolera taps repetidos y doble envío.
- [ ] Tolera reintentos y desorden de comandos.
- [ ] Falla de forma segura ante errores.
- [ ] No expone información sensible en errores.

---

## 3. Backend (Cloud Functions)

- [ ] Toda escritura crítica ocurre en Cloud Functions.
- [ ] No hay writes directos a Firestore desde cliente.
- [ ] Las validaciones siguen el orden canónico:
  - auth
  - usuario activo
  - empresa activa
  - módulo activo
  - capacidad
  - estado
  - secuencia
  - idempotencia
- [ ] Usa transacciones para efectos múltiples.
- [ ] Implementa idempotencia por `commandId`.

---

## 4. Comandos de dominio

- [ ] El comando es inmutable.
- [ ] El `commandId` es único y persistente.
- [ ] El backend maneja duplicados correctamente.
- [ ] El backend devuelve respuestas tipadas.
- [ ] El rechazo no corrompe estado.

---

## 5. Auditoría

- [ ] Toda acción sensible genera auditoría.
- [ ] Auditoría se escribe desde backend.
- [ ] Incluye actor, acción, resultado y origen.
- [ ] No existe delete ni update de auditoría.

---

## 6. Modelo de datos

- [ ] Todos los documentos incluyen `companyId`.
- [ ] No hay documentos huérfanos.
- [ ] Los estados son explícitos.
- [ ] No hay updates genéricos sin comando.
- [ ] El versionado se respeta.

---

## 7. Reglas Firebase

- [ ] Deny by default confirmado.
- [ ] Aislamiento por `companyId`.
- [ ] Firestore solo lectura desde cliente.
- [ ] Storage sin acceso público.
- [ ] App Check activo y validado.

---

## 8. Cliente Web

- [ ] No implementa lógica de permisos.
- [ ] Usa Server Actions para mutaciones.
- [ ] Valida inputs con esquemas.
- [ ] Refleja módulos y capacidades efectivas.
- [ ] Maneja errores sin filtrar información.

---

## 9. Cliente Android (Capacitor)

- [ ] Usa SQLite para cola offline.
- [ ] No asume éxito inmediato.
- [ ] Envía comandos uno por uno.
- [ ] Maneja estado `pending / accepted / rejected`.
- [ ] Evidencias subidas antes del comando.
- [ ] No usa Base64 para evidencias.

---

## 10. Offline-first

- [ ] El flujo funciona sin conexión.
- [ ] El sistema se recupera tras cierre de app.
- [ ] No hay corrupción de estado local.
- [ ] El backend decide el estado final.

---

## 11. Build y release

- [ ] Build reproducible.
- [ ] Blindaje Android aplicado.
- [ ] Sin debug en producción.
- [ ] Sin imports administrativos en Android.
- [ ] El pipeline falla ante violaciones.

---

## 12. UX defensiva

- [ ] Botones toleran múltiples taps.
- [ ] Formularios toleran reenvíos.
- [ ] El sistema no se rompe por uso incorrecto.
- [ ] Los errores son claros pero no verbosos.

---

## 13. UX canónica

- [ ] La UI cumple SISTEMA_UX_CANONICO.md.
- [ ] No asume éxito inmediato.
- [ ] Muestra estados pending / accepted / rejected.
- [ ] Tolera taps repetidos.
- [ ] No usa confirmaciones como parche.
- [ ] Funciona offline sin ambigüedad.

---

## Regla final de aprobación

> Un PR solo se aprueba si **todos los checks aplicables** están marcados.
> Un solo punto crítico fallido bloquea el merge.
