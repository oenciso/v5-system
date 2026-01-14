# SISTEMA_CANONICO_v1.15.1.md

## 15. Arquitectura cliente (Web y Android)

> **Nota de cumplimiento**
>
> Todas las medidas descritas en esta sección **deben cumplir con estándares reales de sistemas en producción**.
> No se aceptan soluciones experimentales, incompletas o solo válidas en entornos de prueba.

---

## 15.1 Principios comunes (actualizado)

- Ningún cliente es confiable.
- La lógica crítica vive en backend.
- La UI solo ejecuta intenciones válidas.
- La visibilidad depende de módulos y capacidades efectivas.
- El cliente debe poder ser descartado sin perder integridad del sistema.
- **Todas las decisiones técnicas deben ser compatibles con entornos productivos auditables.**

---

## 15.2 Web (administración y supervisión)

### Estándares mínimos obligatorios

- Protección CSRF en todas las acciones mutativas.
- Validación estricta de inputs (schema-based).
- Control de sesiones seguro.
- Uso exclusivo de HTTPS.
- Headers de seguridad configurados.
- Manejo correcto de errores (sin fuga de información).
- Acceso basado en capacidades efectivas.

Nada “temporal” llega a producción.

---

## 15.3 Android (operación diaria – Capacitor)

### Estándares mínimos obligatorios

- Build reproducible y firmado.
- Sin debug flags en release.
- Plugins estables y mantenidos.
- Sin permisos innecesarios.
- Protección contra inspección básica.
- Manejo correcto de fallos offline y corrupción local.
- Validación completa en backend al sincronizar.

Offline-first **no** implica estándares más bajos.

---

## 15.4 Revisión de seguridad

- Cualquier cambio en esta sección:
  - requiere revisión explícita
  - no se aprueba por conveniencia
- Las medidas deben alinearse con:
  - prácticas comunes de producción
  - criterios de auditoría técnica
  - expectativas legales razonables

---

## Regla de cierre (actualizada)

> Si una medida no sería aceptable
> en un sistema real en producción,
> no es aceptable aquí.
