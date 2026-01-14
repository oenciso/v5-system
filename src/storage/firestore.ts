/**
 * @fileoverview Firebase Firestore Initialization
 * @module storage/firestore
 * 
 * FASE 3 - PASO 5: INICIALIZACIÓN DE FIRESTORE
 * 
 * Este módulo inicializa Firebase Admin SDK para Firestore.
 * Se usa para idempotencia y persistencia de comandos.
 * 
 * Principios del Canon:
 * - "Backend como autoridad única"
 * - Firestore es la fuente de verdad para state
 */

import * as admin from 'firebase-admin';

/**
 * Estado de inicialización de Firestore.
 */
let firestoreInitialized = false;

/**
 * Referencia al Firestore.
 */
let firestoreInstance: admin.firestore.Firestore | null = null;

/**
 * Inicializa Firebase Admin SDK y obtiene Firestore.
 * 
 * La inicialización ocurre una sola vez (singleton).
 * En entornos de Cloud Functions, las credenciales se obtienen automáticamente.
 * 
 * @returns Firestore instance
 */
export function initializeFirestore(): admin.firestore.Firestore {
    if (!firestoreInitialized) {
        // Inicializar solo si no existe una app
        if (admin.apps.length === 0) {
            admin.initializeApp({
                // Las credenciales se obtienen automáticamente de:
                // 1. GOOGLE_APPLICATION_CREDENTIALS (archivo JSON)
                // 2. Metadata del entorno de Cloud Functions
            });
        }

        firestoreInstance = admin.firestore();
        firestoreInitialized = true;
    }

    return firestoreInstance!;
}

/**
 * Obtiene la instancia de Firestore.
 * Lanza error si Firestore no está inicializado.
 * 
 * @returns Firestore instance
 * @throws Error si Firestore no está inicializado
 */
export function getFirestore(): admin.firestore.Firestore {
    if (!firestoreInitialized || !firestoreInstance) {
        throw new Error(
            'Firestore no está inicializado. Llama a initializeFirestore() primero.'
        );
    }
    return firestoreInstance;
}

/**
 * Verifica si Firestore está inicializado.
 * 
 * @returns true si Firestore está inicializado
 */
export function isFirestoreInitialized(): boolean {
    return firestoreInitialized;
}

/**
 * Re-exportar tipos útiles de Firestore.
 */
export type Timestamp = admin.firestore.Timestamp;
export type DocumentReference = admin.firestore.DocumentReference;
export type DocumentSnapshot = admin.firestore.DocumentSnapshot;
export type CollectionReference = admin.firestore.CollectionReference;
export type Transaction = admin.firestore.Transaction;
export type FieldValue = typeof admin.firestore.FieldValue;
