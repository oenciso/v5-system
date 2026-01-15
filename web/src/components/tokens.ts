/**
 * @fileoverview Canonical Design Tokens
 * @module components/tokens
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Tokens semánticos del sistema canónico.
 * Ver: SISTEMA_UI_CANONICO.md §3
 */

// ============================================================================
// COLORES SEMÁNTICOS
// ============================================================================

/**
 * Colores base (Web)
 */
export const colors = {
    // Navigation / Sidebar
    navigation: '#0B1C2D',

    // Background principal
    background: '#F8FAFC',

    // Card background
    card: '#FFFFFF',

    // Estados semánticos
    success: '#10B981',      // Accepted / Success - Verde
    pending: '#F59E0B',      // Pending - Amarillo
    error: '#EF4444',        // Rejected / Error - Rojo
    disabled: '#9CA3AF',     // Disabled - Gris

    // Text
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textInverse: '#FFFFFF'
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem'      // 48px
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
        xs: '0.75rem',   // 12px
        sm: '0.875rem',  // 14px
        base: '1rem',    // 16px
        lg: '1.125rem',  // 18px
        xl: '1.5rem',    // 24px
        xxl: '2rem'      // 32px
    },
    fontWeight: {
        normal: '400',
        medium: '500',
        bold: '700'
    }
} as const;

// ============================================================================
// BORDERS
// ============================================================================

export const borders = {
    radius: {
        sm: '0.25rem',   // 4px
        md: '0.5rem',    // 8px
        lg: '1rem',      // 16px
        full: '9999px'
    }
} as const;
