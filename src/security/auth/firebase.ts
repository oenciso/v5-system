/**
 * @fileoverview Firebase Admin SDK Initialization
 * @module security/auth/firebase
 * 
 * FASE 2 - PASO 6: INTEGRACIÓN CON FIREBASE AUTH
 * 
 * Este módulo inicializa Firebase Admin SDK SOLO para autenticación.
 * 
 * NO usa:
 * - Firestore
 * - Storage
 * - Realtime Database
 * - Cloud Messaging
 * 
 * Principios del Canon:
 * - "Backend como autoridad única"
 * - Firebase Auth verifica tokens de forma criptográfica
 */

import * as admin from 'firebase-admin';

/**
 * Estado de inicialización de Firebase.
 */
let firebaseInitialized = false;

/**
 * Inicializa Firebase Admin SDK.
 * 
 * La inicialización ocurre una sola vez (singleton).
 * En entornos de Cloud Functions, las credenciales se obtienen automáticamente.
 * En desarrollo local, se requiere GOOGLE_APPLICATION_CREDENTIALS.
 * 
 * @returns Firebase Auth instance
 */
export function initializeFirebaseAuth(): admin.auth.Auth {
    if (!firebaseInitialized) {
        // Inicializar solo si no existe una app
        if (admin.apps.length === 0) {
            admin.initializeApp({
                // Las credenciales se obtienen automáticamente de:
                // 1. GOOGLE_APPLICATION_CREDENTIALS (archivo JSON)
                // 2. Metadata del entorno de Cloud Functions
            });
        }
        firebaseInitialized = true;
    }

    return admin.auth();
}

/**
 * Obtiene la instancia de Firebase Auth.
 * Lanza error si Firebase no está inicializado.
 * 
 * @returns Firebase Auth instance
 * @throws Error si Firebase no está inicializado
 */
export function getFirebaseAuth(): admin.auth.Auth {
    if (!firebaseInitialized) {
        throw new Error(
            'Firebase Auth no está inicializado. Llama a initializeFirebaseAuth() primero.'
        );
    }
    return admin.auth();
}

/**
 * Verifica si Firebase está inicializado.
 * 
 * @returns true si Firebase está inicializado
 */
export function isFirebaseInitialized(): boolean {
    return firebaseInitialized;
}

/**
 * Re-exportar tipos útiles de Firebase Admin.
 */
export type DecodedIdToken = admin.auth.DecodedIdToken;
