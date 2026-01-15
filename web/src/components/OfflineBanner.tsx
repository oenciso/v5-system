/**
 * @fileoverview Canonical OfflineBanner Component
 * @module components/OfflineBanner
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Banner para indicar estado offline.
 * Ver: SISTEMA_UI_CANONICO.md §2.6
 * 
 * Regla canónica: Offline actions are marked as pending.
 */

import { useEffect, useState } from 'react';
import { colors, spacing, typography } from './tokens';

// ============================================================================
// STYLES
// ============================================================================

const bannerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.pending,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily,
    zIndex: 9999
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Offline banner component.
 * 
 * Shows when the browser is offline.
 * Actions taken while offline are marked as pending.
 */
export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) {
        return null;
    }

    return (
        <div style={bannerStyle} role="alert">
            <OfflineIcon />
            <span>Sin conexión — Los comandos quedarán pendientes</span>
        </div>
    );
}

/**
 * Offline icon.
 */
function OfflineIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
    );
}
