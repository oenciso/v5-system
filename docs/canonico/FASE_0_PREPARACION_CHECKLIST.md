# FASE_0_PREPARACION_CHECKLIST.md

## Fase 0 — Preparación (Checklist detallada por tarea)

Esta checklist define **todo lo que debe existir antes de escribir lógica del sistema**.
Si un punto no se cumple, **no se avanza de fase**.

---

## 0.1 Repositorio y control de cambios

- [ ] Repositorio creado (privado).
- [ ] Rama `main` protegida.
- [ ] Merge solo vía Pull Request.
- [ ] Commits claros y trazables.
- [ ] Historial limpio (sin commits experimentales).

---

## 0.2 Documentación canónica versionada

Verificar que **todos** estos archivos estén en el repo:

- [ ] `SISTEMA_CANONICO_FINAL.md`
- [ ] `SISTEMA_UX_CANONICO.md`
- [ ] `LINEAMIENTOS_IMPLEMENTACION_GEMINI_PRO_3.md`
- [ ] `CHECKLIST_REVISION_PR_GEMINI_PRO_3.md`
- [ ] `RFC-0_PLAN_EJECUCION_POR_FASES.md`
- [ ] `PROMPT_MAESTRO_GEMINI_PRO_3.md`

Regla:
> Ningún desarrollo sin estos documentos presentes.

---

## 0.3 Templates obligatorios

- [ ] Template de Pull Request creado.
- [ ] Template incluye checklist de revisión.
- [ ] Template obliga a:
  - fase del RFC
  - módulo
  - capacidades
  - comandos

---

## 0.4 CI / Automatización mínima

- [ ] Pipeline CI configurado.
- [ ] Typecheck obligatorio.
- [ ] Lint obligatorio.
- [ ] Build falla ante error.
- [ ] CI corre en cada PR.

No se permite merge con CI rojo.

---

## 0.5 Convenciones de proyecto

- [ ] Estructura base de carpetas definida.
- [ ] Convención de nombres acordada.
- [ ] Separación clara:
  - dominio
  - infraestructura
  - UI
- [ ] Alias de imports configurados.

---

## 0.6 Seguridad inicial

- [ ] Firebase project creado.
- [ ] App Check habilitado (aunque no usado aún).
- [ ] Entornos separados (dev / prod).
- [ ] Variables de entorno protegidas.
- [ ] Accesos mínimos otorgados.

---

## 0.7 Stack congelado (fase 0)

- [ ] Versiones iniciales definidas.
- [ ] No upgrades “porque sí”.
- [ ] Dependencias documentadas.
- [ ] Plugins Android listados.

---

## 0.8 Validación humana final

Antes de cerrar Fase 0:

- [ ] Todos los documentos fueron leídos.
- [ ] No hay dudas abiertas críticas.
- [ ] El orden del RFC es entendido.
- [ ] Se acepta que la velocidad viene después.

---

## Criterio de cierre de Fase 0

> Fase 0 se considera cerrada solo si:
> - todos los checks están completos
> - no hay excepciones
> - no hay “lo vemos luego”

Si algo parece excesivo,
es porque evita deuda futura.
