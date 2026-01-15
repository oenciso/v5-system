/**
 * @fileoverview Authentication Context for Web App
 * @module lib/auth
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Maneja el estado de autenticación.
 * NO infiere permisos ni roles - eso lo hace el backend.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Authentication state.
 */
export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Auth context value.
 * 
 * NOTA: NO incluimos rol ni permisos aquí.
 * El backend es la única autoridad para eso.
 */
export interface AuthContextValue {
    /** Current auth state */
    readonly state: AuthState;

    /** Firebase user (if authenticated) */
    readonly user: User | null;

    /** Sign in with email and password */
    readonly signIn: (email: string, password: string) => Promise<void>;

    /** Sign out */
    readonly signOut: () => Promise<void>;

    /** Error from last auth operation */
    readonly error: string | null;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth provider component.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>('loading');
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const auth = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                setState('authenticated');
            } else {
                setUser(null);
                setState('unauthenticated');
            }
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        setError(null);
        try {
            const auth = getFirebaseAuth();
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign in';
            setError(message);
            throw err;
        }
    };

    const signOut = async () => {
        setError(null);
        try {
            const auth = getFirebaseAuth();
            await firebaseSignOut(auth);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign out';
            setError(message);
            throw err;
        }
    };

    const value: AuthContextValue = {
        state,
        user,
        signIn,
        signOut,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context.
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Get company ID from user token.
 * This is needed for command construction.
 */
export async function getCompanyId(): Promise<string | null> {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
        return null;
    }

    try {
        const tokenResult = await user.getIdTokenResult();
        return (tokenResult.claims.companyId as string) ?? null;
    } catch {
        return null;
    }
}
