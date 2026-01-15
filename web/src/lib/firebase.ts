/**
 * @fileoverview Firebase Configuration for Web App
 * @module lib/firebase
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Configura Firebase para autenticación y comunicación con backend.
 * NO contiene lógica de negocio.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFunctions, Functions } from 'firebase/functions';

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

/**
 * Firebase configuration from environment variables.
 * 
 * These must be set in .env.local or environment:
 * VITE_FIREBASE_API_KEY
 * VITE_FIREBASE_AUTH_DOMAIN
 * VITE_FIREBASE_PROJECT_ID
 * VITE_FIREBASE_STORAGE_BUCKET
 * VITE_FIREBASE_MESSAGING_SENDER_ID
 * VITE_FIREBASE_APP_ID
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? ''
};

// ============================================================================
// FIREBASE INSTANCES
// ============================================================================

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;

/**
 * Initialize Firebase app.
 * Only initializes once (singleton).
 */
export function getFirebaseApp(): FirebaseApp {
    if (!app) {
        app = initializeApp(firebaseConfig);
    }
    return app;
}

/**
 * Get Firebase Auth instance.
 */
export function getFirebaseAuth(): Auth {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}

/**
 * Get Firebase Functions instance.
 */
export function getFirebaseFunctions(): Functions {
    if (!functions) {
        functions = getFunctions(getFirebaseApp());
    }
    return functions;
}
