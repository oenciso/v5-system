# SISTEMA_CANONICO_v1.1.md

## 1. Propósito del sistema

### 1.1 Qué es este sistema

Este sistema es una plataforma **multiempresa (multi-tenant)** de control y registro para actividades de seguridad privada.
Está diseñada para venderse como servicio, donde cada empresa cliente opera de forma **aislada**, segura e independiente.

Funciona de manera confiable en campo, incluso sin conexión a internet, y aplica control estricto desde backend cuando la conexión existe.

No es un sistema genérico.
No es un sistema administrativo tradicional.
Es un sistema **operativo-first**, multiempresa y con validación centralizada.

---

### 1.2 Modelo multiempresa (fundamental)

- El sistema soporta múltiples empresas clientes.
- Cada empresa es una **unidad de aislamiento total**.
- Los usuarios pertenecen **exactamente a una empresa**.
- Un usuario **no puede**:
  - ver datos de otra empresa
  - interactuar con operaciones de otra empresa
  - inferir la existencia de otra empresa

Este aislamiento aplica a:
- Firestore
- Storage
- Auditoría
- Operación offline
- Reportes

No existen excepciones.

---

### 1.3 Problema que resuelve

Resuelve estos problemas concretos:

- Falta de trazabilidad real en operaciones de seguridad.
- Registros manuales poco confiables o alterables.
- Dependencia excesiva de supervisión humana.
- Sistemas que confían demasiado en el cliente.
- Dificultad para operar sin conexión estable.
- Evidencia débil ante auditorías o conflictos.
- Riesgo de fuga de información entre empresas.

---

### 1.4 Qué SÍ debe hacer

El sistema debe:

- Permitir operación diaria en campo (Android).
- Funcionar offline sin perder información.
- Registrar acciones operativas con evidencia.
- Validar todas las acciones en backend.
- Mantener auditoría inmutable.
- Garantizar aislamiento total entre empresas.
- Adaptarse a distintos tipos de operación sin reescritura.
- Escalar por adición de capacidades, no por parches.

---

### 1.5 Qué NO debe hacer

El sistema NO debe:

- Compartir datos entre empresas.
- Permitir lectura cruzada por error de reglas.
- Confiar en la UI para validar acciones.
- Permitir operaciones críticas sin auditoría.
- Permitir bypass por rol, cliente o dispositivo.
- Exponer funcionalidades no activadas.
- Priorizar rapidez sobre seguridad.

---

### 1.6 Usuarios objetivo

Usuarios previstos:

- Guardias operativos (campo).
- Supervisores operativos.
- Administradores de la empresa cliente.
- Superadministradores del sistema (plataforma).

Cada usuario:
- pertenece a una sola empresa (excepto superadmin),
- ve y hace solo lo que le corresponde,
- nunca cruza límites empresariales.

---

### 1.7 Principio rector

> El sistema existe para registrar la realidad operativa
> de cada empresa de forma aislada, verificable y auditable,
> no para embellecerla ni compartirla.

Todo lo que no respete el aislamiento entre empresas
no pertenece al sistema.
