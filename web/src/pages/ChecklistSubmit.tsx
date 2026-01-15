/**
 * @fileoverview Checklist Submit Page
 * @module pages/ChecklistSubmit
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Pantalla de prueba de integración.
 * Envía un comando checklist.submit y muestra estados.
 * 
 * Reglas canónicas aplicadas:
 * - La UI NUNCA asume éxito
 * - La UI NUNCA infiere permisos
 * - La UI refleja SOLO la verdad del backend
 * - Todas las acciones son comandos
 * - Los errores se muestran, nunca se ocultan
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth, getCompanyId } from '../lib/auth';
import type { CommandExecutionState, CommandResult, Command } from '../lib/command-client';
import {
    executeCommand,
    generateCommandId,
    createInitialState,
    createPendingState,
    createAcceptedState,
    createRejectedState
} from '../lib/command-client';
import {
    PrimaryButton,
    StatusBadge,
    ErrorInline,
    colors,
    spacing,
    typography,
    borders
} from '../components';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Checklist submit payload.
 * Must match backend: ChecklistSubmitPayload
 */
interface ChecklistSubmitPayload {
    readonly checklistId: string;
    readonly answers: readonly ChecklistAnswer[];
    readonly notes?: string;
}

interface ChecklistAnswer {
    readonly questionId: string;
    readonly value: unknown;
    readonly notes?: string;
}

/**
 * Checklist submit receipt.
 * Must match backend: ChecklistSubmitReceipt
 */
interface ChecklistSubmitReceipt {
    readonly submissionId: string;
    readonly checklistId: string;
    readonly submittedAt: number;
    readonly answerCount: number;
}

// ============================================================================
// STYLES
// ============================================================================

const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: colors.background,
    padding: spacing.xl,
    fontFamily: typography.fontFamily
};

const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto'
};

const headerStyle: React.CSSProperties = {
    marginBottom: spacing.xl
};

const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    margin: 0,
    marginBottom: spacing.sm
};

const subtitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    margin: 0
};

const cardStyle: React.CSSProperties = {
    backgroundColor: colors.card,
    borderRadius: borders.radius.lg,
    padding: spacing.xl,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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

const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical'
};

const statusContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg
};

const resultCardStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    borderRadius: borders.radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    fontSize: typography.fontSize.sm
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Checklist Submit Page.
 * 
 * Proof of integration - executes checklist.submit command
 * and displays state transitions correctly.
 */
export function ChecklistSubmitPage() {
    const { state: authState, user } = useAuth();

    // Form state
    const [checklistId, setChecklistId] = useState('checklist_001');
    const [answer1, setAnswer1] = useState('');
    const [answer2, setAnswer2] = useState('');
    const [notes, setNotes] = useState('');

    // Command state
    const [commandState, setCommandState] = useState<CommandExecutionState<ChecklistSubmitReceipt>>(
        createInitialState()
    );

    // Auth check
    if (authState === 'loading') {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (authState === 'unauthenticated') {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <ErrorInline message="You must be signed in to submit a checklist" />
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Get company ID from token
        const companyId = await getCompanyId();
        if (!companyId) {
            setCommandState(createRejectedState({
                outcome: 'REJECTED',
                commandId: 'unknown',
                rejection: {
                    code: 'AUTH_ERROR',
                    message: 'Could not determine company ID',
                    stage: 'CLIENT'
                }
            }));
            return;
        }

        // Build command
        const command: Command<ChecklistSubmitPayload> = {
            commandId: generateCommandId(),
            commandType: 'checklist.submit',
            issuedAt: Date.now(),
            companyId,
            payload: {
                checklistId,
                answers: [
                    { questionId: 'q1', value: answer1 },
                    { questionId: 'q2', value: answer2 }
                ],
                ...(notes && { notes })
            }
        };

        // Set pending state IMMEDIATELY
        setCommandState(createPendingState());

        // Execute command
        const result: CommandResult<ChecklistSubmitReceipt> = await executeCommand(command);

        // Update state based on result
        // CANONICAL: We NEVER assume success - we reflect backend truth
        if (result.outcome === 'ACCEPTED') {
            setCommandState(createAcceptedState(result));
        } else {
            setCommandState(createRejectedState(result));
        }
    };

    const getStatusVariant = () => {
        switch (commandState.state) {
            case 'idle':
                return 'idle' as const;
            case 'pending':
                return 'pending' as const;
            case 'accepted':
                return 'accepted' as const;
            case 'rejected':
                return 'rejected' as const;
        }
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <header style={headerStyle}>
                    <h1 style={titleStyle}>Submit Checklist</h1>
                    <p style={subtitleStyle}>
                        Proof of integration - Phase 4 Step 1
                    </p>
                </header>

                <div style={cardStyle}>
                    {/* Status display */}
                    <div style={statusContainerStyle}>
                        <span style={{ color: colors.textSecondary }}>Status:</span>
                        <StatusBadge variant={getStatusVariant()} />
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Checklist ID */}
                        <div style={formGroupStyle}>
                            <label style={labelStyle} htmlFor="checklistId">
                                Checklist ID
                            </label>
                            <input
                                id="checklistId"
                                style={inputStyle}
                                type="text"
                                value={checklistId}
                                onChange={(e) => setChecklistId(e.target.value)}
                                disabled={commandState.state === 'pending'}
                                required
                            />
                        </div>

                        {/* Answer 1 */}
                        <div style={formGroupStyle}>
                            <label style={labelStyle} htmlFor="answer1">
                                Question 1: Safety check performed?
                            </label>
                            <input
                                id="answer1"
                                style={inputStyle}
                                type="text"
                                placeholder="Yes / No"
                                value={answer1}
                                onChange={(e) => setAnswer1(e.target.value)}
                                disabled={commandState.state === 'pending'}
                                required
                            />
                        </div>

                        {/* Answer 2 */}
                        <div style={formGroupStyle}>
                            <label style={labelStyle} htmlFor="answer2">
                                Question 2: Equipment functional?
                            </label>
                            <input
                                id="answer2"
                                style={inputStyle}
                                type="text"
                                placeholder="Yes / No"
                                value={answer2}
                                onChange={(e) => setAnswer2(e.target.value)}
                                disabled={commandState.state === 'pending'}
                                required
                            />
                        </div>

                        {/* Notes */}
                        <div style={formGroupStyle}>
                            <label style={labelStyle} htmlFor="notes">
                                Additional Notes (optional)
                            </label>
                            <textarea
                                id="notes"
                                style={textareaStyle}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={commandState.state === 'pending'}
                            />
                        </div>

                        {/* Submit button */}
                        <PrimaryButton
                            type="submit"
                            loading={commandState.state === 'pending'}
                            disabled={commandState.state === 'pending'}
                            style={{ width: '100%' }}
                        >
                            Submit Checklist
                        </PrimaryButton>
                    </form>

                    {/* Error display */}
                    {commandState.state === 'rejected' && commandState.result?.rejection && (
                        <div style={{ marginTop: spacing.lg }}>
                            <ErrorInline
                                message={commandState.result.rejection.message}
                                code={commandState.result.rejection.code}
                            />
                        </div>
                    )}

                    {/* Success display */}
                    {commandState.state === 'accepted' && commandState.result?.receipt && (
                        <div style={resultCardStyle}>
                            <strong>Submission Accepted</strong>
                            <p>Submission ID: {commandState.result.receipt.submissionId}</p>
                            <p>Answers recorded: {commandState.result.receipt.answerCount}</p>
                            <p>Submitted at: {new Date(commandState.result.receipt.submittedAt).toLocaleString()}</p>
                        </div>
                    )}
                </div>

                {/* Debug info */}
                <div style={{ ...resultCardStyle, marginTop: spacing.xl, opacity: 0.7 }}>
                    <strong>Debug Info</strong>
                    <p>User: {user?.email}</p>
                    <p>Command state: {commandState.state}</p>
                    {commandState.result && (
                        <p>Command ID: {commandState.result.commandId}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
