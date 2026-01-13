# SISTEMA_CANONICO_FINAL.md

# Prefacio – Autoridad del documento
Este documento es la autoridad absoluta del sistema. El código obedece al documento, no al revés.
El sistema está diseñado para producción real, usuarios imperfectos y fallos constantes.

La experiencia de usuario (UX/UI) se rige por
SISTEMA_UX_CANONICO.md, el cual tiene autoridad
sobre cualquier decisión de interfaz en web y Android.

---

# 1. Propósito del sistema
Plataforma multiempresa de operación de seguridad privada, offline-first en Android,
con backend autoritativo, auditoría inmutable y venta de acceso como servicio.

---

# 2. Invariantes no negociables
- Multiempresa con aislamiento total
- Backend como autoridad única
- Deny by default
- Separación rol / capacidades / módulos
- Offline solo Android
- Auditoría obligatoria
- Evidencia verificable
- Diseño tolerante a error humano

---

# 3. Modelo de amenazas
Incluye actores maliciosos y no maliciosos.
El usuario torpe, apresurado o descuidado es un actor esperado.
El sistema absorbe duplicados, errores, desorden y reintentos sin romperse.

---

# 4. Roles y jerarquía
Roles duros: Superadmin, Administrador, Supervisor, Guardia.
Los roles ordenan autoridad, no habilitan acciones.

---

# 5. Perfiles operativos
Paquetes de capacidades recomendadas.
No son entidades de seguridad.
Ejemplos: Rondinero, Guardia Accesos, Guardia General.

---

# 6. Ciclo de vida de la empresa
Modelo híbrido:
registro → pago → revisión → activación.
El pago habilita estado, no permisos.
La falta de pago suspende operación.

---

# 7. Capacidades
Permisos atómicos evaluados en backend.
Tener capacidad no garantiza éxito.
Toda acción requiere capacidad explícita.

---

# 8. Módulos y reglas
Los módulos definen existencia.
Soporte explícito de variantes operativas (ej. rondines routed/free).
Acción válida = módulo activo + capacidad + estado correcto.

---

# 9. Comandos de dominio
Toda mutación ocurre por comandos.
Comandos son inmutables, idempotentes y auditables.
Backend decide siempre.

---

# 10. Sync offline (Android)
Cola persistente de comandos.
Reintentos seguros.
Idempotencia obligatoria.
Offline mejora UX, no relaja seguridad.

---

# 11. Modelo de datos
Modelo mínimo canónico.
Campos estructurales obligatorios.
No hay documentos huérfanos ni updates libres.

---

# 12. Evidencias
Storage obligatorio.
Hash verificable.
Nunca Base64.
Evidencia sin evento no existe.

---

# 13. Auditoría
Registro inmutable de acciones.
Se auditan éxitos y fallos.
Sin delete, sin update.

---

# 14. Reglas Firebase
Deny by default.
Aislamiento por companyId.
Firestore lectura, CF escritura.
App Check obligatorio.

---

# 15. Arquitectura cliente
Web: administración, siempre online.
Android: operación, offline-first con Capacitor.
Clientes no deciden seguridad.
Estándares reales de producción obligatorios.

---

# 16. Stack tecnológico
Firebase como backend.
Next.js + TS en web.
Capacitor + SQLite en Android.
Estabilidad sobre moda.

---

# 17. Pipeline de build y release
Build reproducible.
Blindaje Android obligatorio.
Release rastreable y reversible.

---

# 18. Estrategia de evolución
Crecimiento por adición.
Versionado explícito.
Sin reinterpretar datos históricos.

---

# 19. Riesgos conocidos
Técnicos, operativos, seguridad y comerciales.
Documentados y mitigados explícitamente.

---

# 20. Glosario
Definiciones cerradas.
Lo que no está aquí no existe para el sistema.

---

# Regla final

> Este sistema está diseñado para sobrevivir producción real.
> Si una implementación depende de uso correcto para no romperse,
> es incorrecta.
