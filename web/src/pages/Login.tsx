/**
 * @fileoverview Login Page
 * @module pages/Login
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Página de login con Firebase Auth.
 * NO infiere permisos ni roles.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../lib/auth';
import {
    PrimaryButton,
    ErrorInline,
    colors,
    spacing,
    typography,
    borders
} from '../components';

// ============================================================================
// STYLES
// ============================================================================

const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    fontFamily: typography.fontFamily
};

const cardStyle: React.CSSProperties = {
    backgroundColor: colors.card,
    borderRadius: borders.radius.lg,
    padding: spacing.xl,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
};

const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    margin: 0,
    marginBottom: spacing.xl
};

const formGroupStyle: React.CSSProperties = {
    marginBottom: spacing.lg
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: spacing.sm,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily,
    border: `1px solid ${colors.disabled}`,
    borderRadius: borders.radius.md,
    boxSizing: 'border-box'
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Login page component.
 */
export function LoginPage() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signIn(email, password);
            // Navigation is handled by auth state change
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign in';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                <h1 style={titleStyle}>Sign In</h1>

                <form onSubmit={handleSubmit}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            style={inputStyle}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            style={inputStyle}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div style={{ marginBottom: spacing.lg }}>
                            <ErrorInline message={error} />
                        </div>
                    )}

                    <PrimaryButton
                        type="submit"
                        loading={loading}
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        Sign In
                    </PrimaryButton>
                </form>
            </div>
        </div>
    );
}
