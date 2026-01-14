# TECH_DECISIONS_PENDING.md
## Registro de Decisiones Técnicas Pendientes

Este documento registra **lagunas aparentes** o decisiones que podrían parecer abiertas,
pero que **solo pueden resolverse por el Canon o por autorización explícita del Arquitecto**.

Su función es **trazabilidad**, no debate abierto.

---

## 1. Plataforma Objetivo

**Descripción**  
Definir el canal principal de distribución y uso del sistema.

**Estado**: **RESUELTA POR CANON**

**Resolución**  
- Web: Plataforma de **Administración**, siempre online.
- Android: Plataforma de **Operación**, offline-first.

**Referencia Canónica**  
- SISTEMA_CANONICO_FINAL.md — Arquitectura Cliente / Stack Tecnológico.

**Nota**  
Esta decisión no admite reinterpretación.  
No se permite PWA operativa para campo.

---

## 2. Backend del Sistema

**Descripción**  
Determinar si el sistema requiere una capa de servidor lógico autoritativo.

**Estado**: **RESUELTA POR CANON**

**Resolución**  
- Backend autoritativo obligatorio.
- Uso de Firebase (Firestore + Cloud Functions).

**Referencia Canónica**  
- SISTEMA_CANONICO_FINAL.md — Backend decide siempre / Stack Tecnológico.

**Nota**  
No se permite lógica crítica en cliente.

---

## 3. Modo Offline

**Descripción**  
Nivel de operatividad requerido cuando no hay conexión.

**Estado**: **RESUELTA POR CANON**

**Resolución**  
- Offline-first permitido **solo** en Android.
- Web requiere conectividad permanente.

**Referencia Canónica**  
- SISTEMA_CANONICO_FINAL.md — Sincronización Offline / Arquitectura Cliente.

**Nota**  
Offline sin backend autoritativo está prohibido.

---

## Regla Final

Si una decisión listada aquí entra en conflicto con el Canon:

**El Canon prevalece.**