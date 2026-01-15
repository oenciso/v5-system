/**
 * @fileoverview Canonical Components Index
 * @module components
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Componentes canónicos obligatorios.
 * Ver: SISTEMA_UI_CANONICO.md §6
 */

// Design tokens
export * from './tokens';

// Canonical components
export { PrimaryButton } from './PrimaryButton';
export type { PrimaryButtonProps } from './PrimaryButton';

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, StatusVariant } from './StatusBadge';

export { ErrorInline } from './ErrorInline';
export type { ErrorInlineProps } from './ErrorInline';

export { OfflineBanner } from './OfflineBanner';
