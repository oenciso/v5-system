# SISTEMA_CANONICO_v1.18.md

## 16. Stack tecnológico

Esta sección define el **stack tecnológico oficial** del sistema.
El objetivo no es usar lo más nuevo, sino lo **estable, auditable y probado en producción**.

---

## 16.1 Principios de selección

- Tecnología usada en producción real.
- Soporte activo y comunidad estable.
- Seguridad conocida y documentada.
- Costos previsibles.
- Evitar lock-in innecesario (donde sea posible).

La moda tecnológica no es criterio.

---

## 16.2 Backend (plataforma)

### Firebase (núcleo)

- **Firebase Authentication**
  - Autenticación de usuarios.
  - No contiene permisos finales.

- **Firestore**
  - Lecturas operativas y administrativas.
  - Sin escrituras críticas directas desde cliente.

- **Cloud Functions**
  - Única vía para escrituras críticas.
  - Ejecución de comandos de dominio.
  - Validaciones y auditoría.

- **Firebase Storage**
  - Almacenamiento de evidencias.
  - Sin acceso público.
  - Rutas por empresa.

- **App Check**
  - Protección contra abuso automatizado.
  - Obligatorio en todos los clientes.

---

## 16.3 Web (administración)

### Stack recomendado

- **Next.js (App Router)**
  - Render híbrido.
  - Server Actions para comandos.
  - Static donde aplique.

- **TypeScript**
  - Tipado estricto.
  - Contratos explícitos.

- **Zod**
  - Validación de inputs y comandos.
  - Esquemas compartidos con backend.

- **Tailwind CSS**
  - UI consistente.
  - Sin lógica embebida.

---

## 16.4 Android (operación)

### Stack recomendado

- **Capacitor**
  - Shell nativo.
  - Acceso a hardware.
  - Build reproducible.

- **Next.js (static export)**
  - UI servida localmente.
  - Sin servidor web.

- **SQLite (capacitor-community)**
  - Persistencia offline robusta.
  - Cola de comandos.

- **Plugins oficiales Capacitor**
  - Camera
  - Barcode Scanner
  - Network
  - Filesystem
  - Preferences

Plugins no oficiales requieren revisión explícita.

---

## 16.5 Comunicación cliente ↔ backend

- **Cloud Functions (httpsCallable)**
  - Sin REST custom abierto.
  - Contratos tipados.
  - Autorización centralizada.

- **Firestore listeners**
  - Solo lectura.
  - Filtrados por empresa.

---

## 16.6 Versiones y congelación

- Versiones se congelan por release.
- Cambios mayores requieren:
  - revisión
  - actualización del documento canónico
- No se actualiza stack “porque sí”.

---

## 16.7 Observabilidad y operación

- Logs de Cloud Functions.
- Métricas de errores.
- Alertas por fallos críticos.
- Auditoría como fuente primaria.

---

## Regla de cierre

> El stack se elige para sobrevivir en producción,
> no para experimentar.
