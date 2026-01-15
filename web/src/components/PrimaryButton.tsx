/**
 * @fileoverview Canonical PrimaryButton Component
 * @module components/PrimaryButton
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Botón primario canónico.
 * Ver: SISTEMA_UI_CANONICO.md §6
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { colors, spacing, typography, borders } from './tokens';

// ============================================================================
// TYPES
// ============================================================================

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button content */
    children: ReactNode;

    /** Loading state (shows pending) */
    loading?: boolean;
}

// ============================================================================
// STYLES
// ============================================================================

const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily,
    borderRadius: borders.radius.md,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s, opacity 0.2s',
    minWidth: '120px'
};

const normalStyle: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: colors.navigation,
    color: colors.textInverse
};

const loadingStyle: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: colors.pending,
    color: colors.textPrimary,
    cursor: 'wait'
};

const disabledStyle: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: colors.disabled,
    color: colors.textInverse,
    cursor: 'not-allowed',
    opacity: 0.7
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Primary button component.
 * 
 * States:
 * - Normal: Dark background
 * - Loading: Pending (yellow) background
 * - Disabled: Gray background
 */
export function PrimaryButton({
    children,
    loading = false,
    disabled = false,
    style,
    ...props
}: PrimaryButtonProps) {
    const computedStyle = disabled
        ? disabledStyle
        : loading
            ? loadingStyle
            : normalStyle;

    return (
        <button
            style={{ ...computedStyle, ...style }}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <LoadingSpinner />}
            {children}
        </button>
    );
}

/**
 * Simple loading spinner.
 */
function LoadingSpinner() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
                animation: 'spin 1s linear infinite'
            }}
        >
            <circle cx="12" cy="12" r="10" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </svg>
    );
}
