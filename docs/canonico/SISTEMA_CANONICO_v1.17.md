# SISTEMA_CANONICO_v1.19.md

## 17. Pipeline de build y release

Esta sección define **cómo se construye, valida y libera** el sistema.
El pipeline es parte de la seguridad.
Un build incorrecto es un incidente.

---

## 17.1 Principios

- Todo build debe ser reproducible.
- Todo release debe ser rastreable.
- Fallar el build es preferible a liberar algo inseguro.
- No existen releases “manuales” sin pipeline.

---

## 17.2 Control de código fuente

- Repositorio versionado.
- Ramas protegidas.
- Revisión obligatoria para cambios críticos.
- Commits firmados (cuando aplique).

---

## 17.3 Build Web (administración)

### Pasos obligatorios

1. Instalación limpia de dependencias.
2. Lint y type-check.
3. Validación de esquemas.
4. Build de producción.
5. Tests críticos (si existen).

### Restricciones

- Sin flags de debug.
- Sin variables secretas en cliente.
- Headers de seguridad verificados.

---

## 17.4 Build Android (Capacitor)

### Pasos obligatorios

1. Verificación de target Android.
2. Ejecución de scripts de blindaje:
   - exclusión de módulos administrativos
   - detección de imports prohibidos
3. Build static export (UI).
4. Sync Capacitor.
5. Build nativo (Gradle).
6. Firma del APK / AAB.

### Restricciones duras

- Prohibido `server.url`.
- Prohibido live reload.
- Prohibido debug en release.
- Permisos mínimos.

---

## 17.5 Backend (Cloud Functions)

- Build independiente.
- Deploy solo desde pipeline.
- Variables de entorno gestionadas.
- Rollback posible.

---

## 17.6 Versionado

- Versionado semántico.
- Versión ligada a commit.
- Documentación canónica versionada en paralelo.

---

## 17.7 Release

- Release aprobado conscientemente.
- Registro de cambios.
- Auditoría del release.
- Capacidad de rollback.

---

## 17.8 Incidentes de build o release

- Build fallido → no release.
- Release con error → rollback.
- Se documenta el incidente.
- Se ajusta el pipeline si fue evitable.

---

## Regla de cierre

> El pipeline es una barrera de seguridad.
> Si se salta, el sistema pierde integridad.
