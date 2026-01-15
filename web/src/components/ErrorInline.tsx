/**
 * @fileoverview Canonical ErrorInline Component
 * @module components/ErrorInline
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Muestra errores inline.
 * Ver: SISTEMA_UI_CANONICO.md §7
 * 
 * Regla canónica: Los errores se muestran, nunca se ocultan.
 */

import { colors, spacing, typography, borders } from './tokens';

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorInlineProps {
    /** Error message to display */
    message: string;

    /** Optional error code */
    code?: string;
}

// ============================================================================
// STYLES
// ============================================================================

const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: `${colors.error}10`,
    border: `1px solid ${colors.error}`,
    borderRadius: borders.radius.md,
    color: colors.error
};

const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    marginTop: '2px'
};

const contentStyle: React.CSSProperties = {
    flex: 1
};

const messageStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily,
    margin: 0
};

const codeStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily,
    opacity: 0.8,
    marginTop: spacing.xs
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Inline error display component.
 * 
 * Canonical: Errors are shown, never hidden.
 */
export function ErrorInline({ message, code }: ErrorInlineProps) {
    return (
        <div style={containerStyle} role="alert">
            <ErrorIcon />
            <div style={contentStyle}>
                <p style={messageStyle}>{message}</p>
                {code && <p style={codeStyle}>Code: {code}</p>}
            </div>
        </div>
    );
}

/**
 * Error icon.
 */
function ErrorIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={iconStyle}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}
