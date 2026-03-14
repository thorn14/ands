/**
 * @module editable-form/state-machine
 * @description State machine type definitions for the Editable Form pattern.
 *
 * State transitions:
 * ```
 *  idle ──START_EDIT──► editing ──SUBMIT──► validating
 *   ▲                      ▲                    │
 *   │                      │ VALIDATION_FAILURE  │ VALIDATION_SUCCESS
 *   │                      └────────────────────◄┘
 *   │                                            │
 *   │                                      submitting
 *   │                                     /         \
 *   │                         SUBMIT_SUCCESS     SUBMIT_FAILURE
 *   │                                ▼                 ▼
 *   └─────────RESET──────────── success           error
 *             (from any state)
 * ```
 *
 * States are serializable objects (no functions, no closures).
 * Side effects are abstracted via the `EffectDispatch` interface — adapters
 * provide implementations; the state machine is pure.
 */

import type { FieldId } from '@ands/contracts';

// ---------------------------------------------------------------------------
// State shapes
// ---------------------------------------------------------------------------

/** Form has not been opened for editing. Data is in view-only mode. */
export interface IdleState {
  readonly status: 'idle';
}

/**
 * User is actively editing. `dirty` holds uncommitted field values.
 * `validationErrors` holds any errors from a failed validation pass.
 */
export interface EditingState {
  readonly status: 'editing';
  readonly dirty: Record<string, unknown>;
  readonly validationErrors: ValidationError[];
}

/** Form is running client-side validation before submission. */
export interface ValidatingState {
  readonly status: 'validating';
  readonly dirty: Record<string, unknown>;
}

/**
 * Form has passed validation and the API call is in-flight.
 * `values` are the validated, committed values being submitted.
 */
export interface SubmittingState {
  readonly status: 'submitting';
  readonly values: Record<string, unknown>;
}

/** Submission completed successfully. */
export interface SuccessState {
  readonly status: 'success';
  readonly values: Record<string, unknown>;
}

/** Submission failed with a server/API error. */
export interface ErrorState {
  readonly status: 'error';
  readonly values: Record<string, unknown>;
  readonly error: SubmitError;
}

/** Union of all possible form states. */
export type EditableFormState =
  | IdleState
  | EditingState
  | ValidatingState
  | SubmittingState
  | SuccessState
  | ErrorState;

// ---------------------------------------------------------------------------
// Event shapes
// ---------------------------------------------------------------------------

/** User opened the form for editing. */
export interface StartEditEvent {
  readonly type: 'START_EDIT';
  /** Optional initial values to pre-populate the form. */
  readonly initialValues?: Record<string, unknown>;
}

/** User changed a field value. */
export interface FieldChangeEvent {
  readonly type: 'FIELD_CHANGE';
  readonly fieldId: FieldId;
  readonly value: unknown;
}

/** User submitted the form. */
export interface SubmitEvent {
  readonly type: 'SUBMIT';
}

/** Client-side validation passed. */
export interface ValidationSuccessEvent {
  readonly type: 'VALIDATION_SUCCESS';
  /** The validated, normalized field values. */
  readonly values: Record<string, unknown>;
}

/** Client-side validation failed. */
export interface ValidationFailureEvent {
  readonly type: 'VALIDATION_FAILURE';
  readonly errors: ValidationError[];
}

/** API/server submission succeeded. */
export interface SubmitSuccessEvent {
  readonly type: 'SUBMIT_SUCCESS';
}

/** API/server submission failed. */
export interface SubmitFailureEvent {
  readonly type: 'SUBMIT_FAILURE';
  readonly error: SubmitError;
}

/** Reset form to idle state, discarding all changes. */
export interface ResetEvent {
  readonly type: 'RESET';
}

/** Union of all possible events. */
export type EditableFormEvent =
  | StartEditEvent
  | FieldChangeEvent
  | SubmitEvent
  | ValidationSuccessEvent
  | ValidationFailureEvent
  | SubmitSuccessEvent
  | SubmitFailureEvent
  | ResetEvent;

// ---------------------------------------------------------------------------
// Supporting types
// ---------------------------------------------------------------------------

/** A validation error linked to a specific field or a general form error. */
export interface ValidationError {
  /** Field ID, or undefined for form-level errors. */
  fieldId?: FieldId;
  /** Human-readable error message. */
  message: string;
  /** Machine-readable error code for i18n/adapter mapping. */
  code?: string;
}

/** Server/API error from a failed submission attempt. */
export interface SubmitError {
  /** Human-readable error message. */
  message: string;
  /** HTTP status code (if available). */
  status?: number;
  /**
   * Field-specific errors from the server.
   * Adapters map these to form field error states.
   */
  fieldErrors?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Effect interface (implemented by adapters, not the state machine)
// ---------------------------------------------------------------------------

/**
 * Side effects triggered by state transitions.
 * Adapters implement these methods using host DS components (toast, router, etc.).
 * The state machine is pure — it does NOT call these directly.
 *
 * The `useEditableForm` hook (or equivalent) in the adapter layer calls the
 * correct effects after each state transition.
 */
export interface EffectDispatch {
  /** Show a success notification. */
  showSuccessToast: (message: string) => void;
  /** Show an error notification. */
  showErrorToast: (message: string) => void;
  /** Show an error banner inline in the form. */
  showErrorBanner: (message: string) => void;
  /** Navigate to a path after success. */
  redirectTo: (path: string) => void;
  /** Scroll viewport to the first field with a validation error. */
  scrollToFirstError: (fieldId: FieldId) => void;
  /** Prompt the user to confirm before submitting. Returns true if confirmed. */
  confirmSubmit: (message: string) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

/** Create the initial idle state. */
export function createInitialState(): IdleState {
  return { status: 'idle' };
}
