# SISTEMA_CANONICO_v1.20.md

## 18. Estrategia de evolución

Esta sección define **cómo el sistema cambia sin romperse**.
La evolución es controlada, explícita y documentada.

---

## 18.1 Principios

- El sistema debe poder crecer sin reescrituras.
- Nada se cambia “en caliente” sin contrato.
- La compatibilidad es prioritaria.
- Lo viejo no se reinterpretada.

---

## 18.2 Agregar funcionalidades nuevas

Agregar una feature **nunca** implica modificar lo existente.

Proceso obligatorio:
1. Definir nuevo módulo (si aplica).
2. Definir nuevas capacidades.
3. Definir comandos nuevos o versiones nuevas.
4. Definir reglas nuevas.
5. Documentar en el canónico.
6. Implementar.

Si requiere tocar reglas existentes → está mal diseñada.

---

## 18.3 Evolución de capacidades

- Las capacidades son aditivas.
- No se reutilizan nombres con semántica distinta.
- Capacidades obsoletas:
  - se marcan como deprecated
  - no se eliminan de inmediato
- El backend sigue validando versiones antiguas.

---

## 18.4 Evolución de comandos

- Todo comando tiene versión.
- Cambios incompatibles → nueva versión.
- Versiones antiguas:
  - siguen funcionando
  - no cambian su comportamiento
- El cliente puede convivir con varias versiones.

---

## 18.5 Evolución del modelo de datos

- Cambios compatibles:
  - agregar campos
  - agregar estados
- Cambios incompatibles:
  - requieren versionado
  - nunca reinterpretan datos históricos
- Migraciones destructivas están prohibidas.

---

## 18.6 Evolución de reglas de seguridad

- Reglas se endurecen, no se relajan.
- Cualquier relajación:
  - debe documentarse
  - debe justificarse
- No existen “parches temporales”.

---

## 18.7 Gestión de deuda técnica

- La deuda se documenta.
- Se prioriza por riesgo, no por incomodidad.
- No se oculta bajo nuevas features.

---

## Regla de cierre

> El sistema evoluciona por adición controlada,
> no por mutación impredecible.
