# SISTEMA_CANONICO_v1.15.md

## 15. Arquitectura cliente

Esta sección define cómo deben comportarse los clientes del sistema.
La arquitectura del cliente **no decide seguridad**; la refleja.

---

## 15.1 Principios comunes

- Ningún cliente es confiable.
- La lógica crítica vive en backend.
- La UI solo ejecuta intenciones válidas.
- La visibilidad depende de módulos y capacidades efectivas.
- El cliente debe poder ser descartado sin perder integridad del sistema.

---

## 15.2 Web (administración y supervisión)

### Propósito
- Configuración administrativa.
- Supervisión operativa.
- Reportes y auditoría.
- Gestión de usuarios, módulos y puntos.

### Características
- Siempre online.
- Sin offline-first.
- Lectura directa desde Firestore (controlada).
- Escrituras solo vía Cloud Functions.

### Restricciones
- No expone rutas latentes.
- No ejecuta lógica de permisos.
- No guarda estados críticos en cliente.

### Seguridad
- Server Actions solo para invocar comandos.
- Validación de contratos antes de enviar comandos.
- Acceso siempre filtrado por empresa.

---

## 15.3 Android (operación diaria – Capacitor)

### Propósito
- Operación en campo.
- Captura de evidencias.
- Escaneo QR.
- Ejecución de rondines, checklists y accesos.

### Características
- Offline-first.
- UI servida desde bundle local (static export).
- Cola local persistente de comandos.
- Sin dependencia de servidor web.

### Restricciones
- No ejecuta administración.
- No expone módulos no operativos.
- No escribe estados finales directos.

### Plugins permitidos (ejemplo)
- Camera
- Barcode Scanner
- Network
- Filesystem
- SQLite
- Preferences

Cualquier plugin nuevo:
- debe justificarse
- debe documentarse
- no puede ampliar superficie de ataque sin revisión

---

## 15.4 Blindajes de build (Android)

- Exclusión de código administrativo en build.
- Scripts que fallan el build ante imports prohibidos.
- Variables de entorno obligatorias para target Android.
- Sin `server.url` en Capacitor.

---

## 15.5 Sincronización y refresco

- Android sincroniza por comandos.
- Tras aceptación:
  - refresca desde Firestore
  - ajusta estado local
- El backend siempre gana.

---

## Regla de cierre

> El cliente es intercambiable.
> El backend es permanente.
