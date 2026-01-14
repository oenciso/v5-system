# SISTEMA_CANONICO_v1.21.md

## 19. Riesgos conocidos

Esta sección identifica **riesgos reales** del sistema.
No se eliminan por ignorarlos.
Se gestionan explícitamente.

---

## 19.1 Principios

- Todo sistema en producción tiene riesgos.
- Los riesgos no documentados son los más peligrosos.
- Se prioriza por impacto, no por probabilidad percibida.
- La mitigación es parte del diseño, no un parche.

---

## 19.2 Riesgos técnicos

### 19.2.1 Dependencia de conectividad intermitente
**Riesgo**
- Pérdida de señal durante operación.
- Sync incompleto o tardío.

**Mitigación**
- Offline-first en Android.
- Cola persistente.
- Idempotencia y reintentos seguros.

---

### 19.2.2 Duplicados y desorden de comandos
**Riesgo**
- Estados inconsistentes en sistemas débiles.

**Mitigación**
- `commandId` único.
- Procesamiento idempotente.
- Validación de secuencia en backend.

---

### 19.2.3 Crecimiento de datos (Storage y Firestore)
**Riesgo**
- Costos elevados.
- Degradación de performance.

**Mitigación**
- Rutas por empresa.
- Políticas de retención documentadas.
- Evidencias optimizadas (compresión).

---

### 19.2.4 Dependencia de proveedores externos
**Riesgo**
- Caídas de Firebase o proveedores de pago.

**Mitigación**
- Diseño tolerante a fallos.
- Estados claros (`pending_*`).
- Reintentos y degradación controlada.

---

## 19.3 Riesgos operativos

### 19.3.1 Error humano constante
**Riesgo**
- Uso incorrecto del sistema.

**Mitigación**
- Backend defensivo.
- Reglas estrictas.
- Rechazos seguros y auditados.

---

### 19.3.2 Abuso interno
**Riesgo**
- Escalación indebida por administradores.

**Mitigación**
- Límites de delegación.
- Auditoría inmutable.
- Separación de roles.

---

### 19.3.3 Configuración incorrecta de empresas
**Riesgo**
- Módulos mal activados.
- Capacidades mal asignadas.

**Mitigación**
- Flujos guiados.
- Estados explícitos.
- Auditoría de cambios.

---

## 19.4 Riesgos de seguridad

### 19.4.1 APK modificado
**Riesgo**
- Bypass de UI.

**Mitigación**
- App Check.
- Backend autoritativo.
- Reglas deny-by-default.

---

### 19.4.2 Errores de reglas
**Riesgo**
- Fuga de datos entre empresas.

**Mitigación**
- Aislamiento por `companyId`.
- Revisión estricta de reglas.
- Testing de reglas.

---

## 19.5 Riesgos comerciales

### 19.5.1 Falta de pago
**Riesgo**
- Uso del sistema sin contrato válido.

**Mitigación**
- Estados de empresa.
- Suspensión automática.
- Avisos progresivos.

---

### 19.5.2 Escalamiento no controlado
**Riesgo**
- Clientes usando más de lo contratado.

**Mitigación**
- Módulos como límites fuertes.
- Activación jerárquica.
- Auditoría de uso.

---

## Regla de cierre

> Un riesgo no documentado
> es un riesgo no gestionado.
