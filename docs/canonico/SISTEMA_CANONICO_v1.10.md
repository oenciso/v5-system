# SISTEMA_CANONICO_v1.10.md

## 10. Contrato de sincronización offline (Android)

Esta sección define **cómo opera Android en modo offline-first** y cómo se sincroniza con el backend.
No describe implementación específica, describe **el contrato que no se puede romper**.

El sistema asume que el cliente puede fallar
en cualquier punto del flujo offline.

---

## 10.1 Principio rector

- Android puede operar sin conexión.
- Android **no** decide estados finales.
- El backend es la autoridad absoluta.
- Toda sincronización es validada como si fuera online.

Offline mejora UX.
Offline **no relaja seguridad**.

---

## 10.2 Qué se permite offline

En Android se permite offline:

- Captura de acciones operativas.
- Captura de evidencias (fotos).
- Escaneo de QR.
- Llenado de checklists.
- Registro de eventos locales.

Todo queda **pendiente**, no confirmado.

---

## 10.3 Qué NO se permite offline

Nunca se permite offline:

- Cambiar estados finales.
- Activar módulos.
- Asignar capacidades.
- Cerrar entidades globales sin validación.
- Borrar o editar registros aceptados.

---

## 10.4 Cola local de comandos

Android mantiene una **cola persistente local**.

Cada elemento de la cola contiene:
- `commandId`
- `commandType`
- `payload`
- `createdAtLocal`
- `attempts`
- `status` (pending | sent | accepted | rejected)

La cola es:
- persistente
- ordenada
- recuperable tras reinicio

---

## 10.5 Generación de comandos

- El comando se genera **antes** de cualquier sync.
- El `commandId` es único e inmutable.
- El payload es el mínimo necesario.
- No se recalcula el comando tras fallo.

---

## 10.6 Proceso de sincronización

1. Android detecta conectividad.
2. Se toma el siguiente comando `pending`.
3. Se envía al backend (Cloud Function).
4. El backend responde:
   - `accepted`
   - `rejected`
5. Android:
   - marca estado
   - registra resultado
   - avanza al siguiente comando

No hay paralelismo agresivo.
La secuencia importa.

---

## 10.7 Idempotencia

- El backend procesa cada `commandId` una sola vez.
- Reintentos devuelven el mismo resultado.
- Android puede reenviar sin riesgo.

---

## 10.8 Manejo de rechazos

Si un comando es rechazado:

- Se marca como `rejected`.
- Se guarda la razón tipada.
- No se reintenta automáticamente.
- Se notifica al usuario cuando aplique.
- El rechazo **se audita**.

---

## 10.9 Evidencias offline

- Las evidencias se guardan localmente.
- Se suben a Storage **antes** del comando final.
- El comando referencia la evidencia ya subida.
- Si falla el upload:
  - no se envía el comando
  - se reintenta el upload

---

## 10.10 Consistencia final

- El backend decide qué quedó aceptado.
- Android refresca datos desde Firestore.
- El estado local se ajusta al estado servidor.

---

## Regla de cierre

> Offline es una comodidad.
> El backend es la verdad.

Cualquier diseño que permita
decisiones finales en cliente
viola este contrato.
