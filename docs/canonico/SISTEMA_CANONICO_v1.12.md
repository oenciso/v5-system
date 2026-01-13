# SISTEMA_CANONICO_v1.12.md

## 12. Evidencias

Esta sección define cómo se capturan, almacenan y validan las evidencias.
La evidencia es un **activo crítico** del sistema y debe ser verificable, inmutable y auditable.

---

## 12.1 Principios

- La evidencia **no vive** en Firestore.
- Firestore guarda solo referencias y metadatos.
- La evidencia es inmutable una vez aceptada.
- Toda evidencia está ligada a un evento real.
- No existen evidencias huérfanas.

---

## 12.2 Tipos de evidencia

El sistema soporta, como mínimo:

- Fotografía (principal)
- Comentario asociado (_toggleable_)
- Metadata técnica (automática)

La extensión a otros tipos (video, audio) es futura y explícita.

---

## 12.3 Flujo de captura (Android)

1. El usuario captura la evidencia.
2. El cliente:
   - redimensiona
   - comprime (JPEG/WebP)
   - elimina EXIF sensible
3. Se calcula `hash` (SHA-256).
4. El archivo se guarda localmente.
5. El archivo se sube a **Firebase Storage**.
6. Solo si el upload es exitoso:
   - se permite el comando que referencia la evidencia.

---

## 12.4 Almacenamiento (Storage)

### Estructura de rutas (obligatoria)

```
/companies/{companyId}/{entityType}/{entityId}/evidence/{evidenceId}
```

Ejemplos:
- incident
- rondin
- checklist
- access
- vehicle

---

## 12.5 Documento de evidencia (Firestore)

Campos mínimos:

- `id`
- `companyId`
- `refType`
- `refId`
- `storagePath`
- `hash`
- `createdAt`
- `createdBy`

Campos opcionales:
- `note`
- `metadata`

---

## 12.6 Validaciones en backend

Para aceptar una evidencia:

- Empresa `active`.
- Usuario `active`.
- Capacidad `evidence.attach`.
- Evento referenciado existe.
- Evento pertenece a la empresa.
- Storage confirma existencia del archivo.
- Hash consistente.

Si algo falla → rechazo.

---

## 12.7 Evidencias offline

- La evidencia se guarda localmente.
- El upload se reintenta hasta éxito.
- El comando se bloquea hasta que la evidencia exista en Storage.
- Si el upload falla permanentemente:
  - la evidencia no se acepta
  - se audita el intento fallido

---

## 12.8 Auditoría

Se audita:

- Captura de evidencia.
- Asociación a evento.
- Rechazo de evidencia.
- Cualquier inconsistencia detectada.

Nada de esto es editable.

---

## 12.9 Qué NO se permite

- Base64 en Firestore.
- Edición posterior.
- Reasignación de evidencia.
- Evidencia sin evento.
- Evidencia cruzada entre empresas.

---

## Regla de cierre

> Una evidencia que no puede verificarse
> no existe para el sistema.
