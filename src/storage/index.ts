/**
 * @fileoverview Storage Module Public API
 * @module storage
 * 
 * FASE 3 - PASO 5
 * Exportaciones públicas del módulo de almacenamiento.
 */

export {
    initializeFirestore,
    getFirestore,
    isFirestoreInitialized
} from './firestore';

export type {
    Timestamp,
    DocumentReference,
    DocumentSnapshot,
    CollectionReference,
    Transaction,
    FieldValue
} from './firestore';
