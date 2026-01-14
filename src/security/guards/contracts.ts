import { AuthorizationResult } from '../policies/contracts';

// El Guard es la barrera final.
// DEBE fallar cerrado (Deny by Default).
// No debe mutar estado, solo validar.
export interface SecurityGuard {
    canActivate(): Promise<AuthorizationResult>;
}

// Representa un rechazo explícito y seguro.
// No debe exponer detalles internos del error en producción.
export class SecurityViolation extends Error {
    constructor(public readonly reason: string, public readonly code: string) {
        super(`Security Violation: ${code} - ${reason}`);
        this.name = 'SecurityViolation';
    }
}
