# Invariantes de Producción

## Reglas No Negociables

- El backend decide siempre.
- **La UI nunca infiere permisos, estados ni decisiones no confirmadas por el backend.**
- Offline-first solo para Android.
- Sin evidencia no hay evento.
- Nada se borra realmente.
- El cliente es hostil por diseño.
- Idempotencia obligatoria.
- TTL obligatorio para comandos.

## Autoridad

Derivado de SISTEMA_CANONICO_FINAL.md.  
Si hay conflicto, el canon prevalece.
