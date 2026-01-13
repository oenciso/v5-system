# SISTEMA_CANONICO_v1.3.md

## 3. Modelo de amenazas (reforzado – producción real)

Esta sección define **las amenazas reales** que el sistema debe resistir en producción.
No se diseña para usuarios ideales.
Se diseña para **personas reales, bajo presión, con errores constantes**.

---

## 3.1 Principio base

- Todo cliente puede fallar.
- Todo usuario puede equivocarse.
- Algunos usuarios pueden abusar.
- Todo error será eventualmente explotado o amplificado.

El sistema debe:
- absorber errores
- rechazar de forma segura
- nunca corromper datos
- nunca escalar el daño

---

## 3.2 Actores de amenaza

### 3.2.1 Usuario operativo malicioso (Guardia)

**Origen**
- App Android (offline / online)

**Intentos probables**
- Registrar acciones no realizadas.
- Repetir acciones offline.
- Alterar tiempos o secuencias.
- Usar QR fuera de contexto.

**Impacto**
- Reportes falsos.
- Evidencia inválida.
- Riesgo legal para la empresa.

**Mitigación**
- Capacidades explícitas.
- Turno obligatorio.
- Validación de secuencia en backend.
- Timestamp de servidor.
- Auditoría inmutable.

---

### 3.2.2 Usuario operativo torpe / apresurado / descuidado (actor crítico)

**Origen**
- App Android
- Uso real en campo

**Características**
- No es malicioso.
- Actúa rápido.
- Se equivoca.
- No siempre entiende el flujo completo.

**Comportamientos esperados**
- Doble envío del mismo formulario.
- Taps repetidos en botones.
- Acciones fuera de orden.
- Formularios incompletos.
- Uso parcial offline (cierra app, pierde señal, vuelve).
- Reintentos manuales excesivos.

**Impacto potencial**
- Comandos duplicados.
- Estados inconsistentes si no se controla.
- Frustración del usuario.
- Corrupción de datos en sistemas débiles.

**Mitigación obligatoria**
- Idempotencia fuerte en backend.
- Rechazos seguros y tipados.
- Validación de orden y estado.
- Backend tolerante a duplicados.
- Auditoría de intentos fallidos.
- UI que no asume éxito inmediato.

> Este actor es **esperado**, no excepcional.

---

### 3.2.3 Supervisor o Administrador malicioso

**Origen**
- Web

**Intentos probables**
- Escalar permisos.
- Activar módulos no contratados.
- Alterar o borrar rastros.
- Asignar capacidades indebidas.

**Impacto**
- Fraude interno.
- Violación contractual.
- Daño reputacional.

**Mitigación**
- Límites de delegación estrictos.
- Activación jerárquica de módulos.
- Auditoría inmutable.
- Separación clara entre admin y superadmin.

---

### 3.2.4 Dispositivo comprometido / APK modificado

**Origen**
- Android alterado
- Ingeniería inversa

**Intentos probables**
- Llamar flujos ocultos.
- Simular estados válidos.
- Forzar sincronización inválida.
- Manipular payloads.

**Impacto**
- Corrupción de datos.
- Bypass de UI.
- Costos operativos.

**Mitigación**
- Reglas Firebase deny-by-default.
- Cloud Functions como única vía de escritura crítica.
- Idempotencia.
- App Check.
- Backend ignora lógica del cliente.

---

### 3.2.5 Usuario externo / atacante automatizado

**Origen**
- Scripts
- Bots
- Requests manuales

**Intentos probables**
- Enumerar datos.
- Abusar endpoints.
- Provocar costos.

**Impacto**
- Fuga de información.
- Denegación de servicio.
- Costos financieros.

**Mitigación**
- Reglas cerradas.
- Queries acotadas.
- Ausencia de endpoints genéricos públicos.

---

## 3.3 Superficies de ataque

- Firestore
- Firebase Storage
- Cloud Functions
- Sincronización offline
- Escaneo QR
- Evidencias

---

## 3.4 Amenazas específicas críticas

### Offline-first (Android)

Amenazas reales:
- Comandos duplicados.
- Envíos fuera de orden.
- Estados locales obsoletos.
- Reconexiones intermitentes.

**Defensa**
- Cola persistente.
- Idempotencia por `commandId`.
- Validación de secuencia.
- Rechazo sin corrupción.

---

### QR y puntos de control

Amenazas:
- Escaneos repetidos.
- Escaneo accidental.
- Escaneo fuera de flujo.
- QR válido en momento inválido.

**Defensa**
- Validación contextual completa.
- Asociación a turno y módulo.
- Auditoría de escaneos rechazados.

---

### Formularios y checklists

Amenazas:
- Envío incompleto.
- Envío doble.
- Abandono a mitad del flujo.

**Defensa**
- Validación completa en backend.
- Envío único por asignación.
- Rechazo seguro y auditado.

---

## 3.5 Impacto aceptable vs inaceptable

**Aceptable**
- Acción rechazada.
- Comando duplicado ignorado.
- Error visible al usuario.
- Reintento requerido.

**Inaceptable**
- Estado corrupto.
- Escritura inválida persistida.
- Evidencia huérfana.
- Cruce de datos entre empresas.

---

## 3.6 Regla de diseño final

> El sistema debe sobrevivir
> al usuario torpe, al usuario malicioso
> y al fallo técnico simultáneamente.

Si una decisión requiere “uso correcto”
para no romper el sistema,
esa decisión es inválida.
