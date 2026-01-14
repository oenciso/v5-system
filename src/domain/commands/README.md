# Domain Commands

## Estado: FASE 2 - PASO 1 (PREPARACIÓN)

Este directorio contiene la infraestructura de comandos de dominio.

### Archivos

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `contracts.ts` | Tipos e interfaces para comandos | ✅ Definido |
| `gateway.ts` | Punto de entrada Cloud Function | ⏳ Pendiente |
| `handlers/` | Handlers por tipo de comando | ⏳ Pendiente |
| `idempotency.ts` | Tabla de idempotencia | ⏳ Pendiente |

### Principios del Canon

> "Toda mutación ocurre por comandos" — SISTEMA_CANONICO_FINAL.md §9

- Los comandos son **inmutables**
- Los comandos son **idempotentes**
- Los comandos son **auditables**
- El **backend decide siempre**

### Prohibiciones

- ❌ Ejecutar comandos sin `SecurityKernel`
- ❌ Mutar estado sin auditoría
- ❌ Aceptar duplicados
- ❌ Procesar comandos expirados

### Siguiente Paso

Implementación del `CommandGateway` en Fase 2, Paso 2+.
