/**
 * @fileoverview Canonical StatusBadge Component
 * @module components/StatusBadge
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Badge para mostrar estados de comandos.
 * Ver: SISTEMA_UI_CANONICO.md §3.2 y §7
 * 
 * Estados canónicos:
 * - pending: Amarillo
 * - accepted: Verde
 * - rejected: Rojo
 */

import { colors, spacing, typography, borders } from './tokens';

// ============================================================================
// TYPES
// ============================================================================

export type StatusVariant = 'pending' | 'accepted' | 'rejected' | 'idle';

export interface StatusBadgeProps {
    /** Status variant */
    variant: StatusVariant;

    /** Optional label (defaults to variant name) */
    label?: string;
}

// ============================================================================
// STYLES
// ============================================================================

const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily,
    borderRadius: borders.radius.full,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const variantStyles: Record<StatusVariant, React.CSSProperties> = {
    idle: {
        ...baseStyle,
        backgroundColor: `${colors.disabled}20`,
        color: colors.disabled
    },
    pending: {
        ...baseStyle,
        backgroundColor: `${colors.pending}20`,
        color: colors.pending
    },
    accepted: {
        ...baseStyle,
        backgroundColor: `${colors.success}20`,
        color: colors.success
    },
    rejected: {
        ...baseStyle,
        backgroundColor: `${colors.error}20`,
        color: colors.error
    }
};

const defaultLabels: Record<StatusVariant, string> = {
    idle: 'Ready',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected'
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Status badge component.
 * 
 * Displays the current state of a command execution.
 * Colors are semantic per canonical spec.
 */
export function StatusBadge({ variant, label }: StatusBadgeProps) {
    const displayLabel = label ?? defaultLabels[variant];

    return (
        <span style={variantStyles[variant]}>
            <StatusDot variant={variant} />
            {displayLabel}
        </span>
    );
}

/**
 * Status dot indicator.
 */
function StatusDot({ variant }: { variant: StatusVariant }) {
    const dotColors: Record<StatusVariant, string> = {
        idle: colors.disabled,
        pending: colors.pending,
        accepted: colors.success,
        rejected: colors.error
    };

    return (
        <span
            style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: dotColors[variant],
                marginRight: spacing.xs,
                ...(variant === 'pending' && {
                    animation: 'pulse 1.5s ease-in-out infinite'
                })
            }}
        >
            {variant === 'pending' && (
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}</style>
            )}
        </span>
    );
}
