/**
 * @module editable-form/reducer
 * @description Pure reducer for the Editable Form state machine.
 *
 * **All switch cases are exhaustive** — `assertNever` in the default branch
 * ensures TypeScript catches any unhandled event at compile time.
 *
 * The reducer is a pure function: (state, event) → state.
 * No side effects. Side effects belong in the adapter's `useEditableForm` hook.
 *
 * @example
 * ```ts
 * import { editableFormReducer, createInitialState } from '@ands/interaction-kit';
 *
 * let state = createInitialState();
 * state = editableFormReducer(state, { type: 'START_EDIT' });
 * // state.status === 'editing'
 * ```
 */

import { assertNever } from '@ands/contracts';
import type {
  EditableFormState,
  EditableFormEvent,
  EditingState,
} from './state-machine.js';

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Pure state transition function for the editable form.
 *
 * Returns the SAME state reference if no transition is valid for the
 * current state/event combination (defensive — logs a warning in dev).
 */
export function editableFormReducer(
  state: EditableFormState,
  event: EditableFormEvent,
): EditableFormState {
  switch (event.type) {
    case 'START_EDIT': {
      // Can start editing from idle, success, or error states
      if (
        state.status === 'idle' ||
        state.status === 'success' ||
        state.status === 'error'
      ) {
        const initialValues =
          state.status === 'success' || state.status === 'error'
            ? { ...state.values, ...event.initialValues }
            : { ...event.initialValues };
        return {
          status: 'editing',
          dirty: initialValues,
          validationErrors: [],
        };
      }
      return warnNoTransition(state, event);
    }

    case 'FIELD_CHANGE': {
      if (state.status === 'editing') {
        return {
          ...state,
          dirty: { ...state.dirty, [event.fieldId]: event.value },
        };
      }
      return warnNoTransition(state, event);
    }

    case 'SUBMIT': {
      if (state.status === 'editing') {
        return {
          status: 'validating',
          dirty: state.dirty,
        };
      }
      return warnNoTransition(state, event);
    }

    case 'VALIDATION_SUCCESS': {
      if (state.status === 'validating') {
        return {
          status: 'submitting',
          values: event.values,
        };
      }
      return warnNoTransition(state, event);
    }

    case 'VALIDATION_FAILURE': {
      if (state.status === 'validating') {
        // Return to editing with errors attached
        const editingState = {
          status: 'editing' as const,
          dirty: state.dirty,
          validationErrors: event.errors,
        } satisfies EditingState;
        return editingState;
      }
      return warnNoTransition(state, event);
    }

    case 'SUBMIT_SUCCESS': {
      if (state.status === 'submitting') {
        return {
          status: 'success',
          values: state.values,
        };
      }
      return warnNoTransition(state, event);
    }

    case 'SUBMIT_FAILURE': {
      if (state.status === 'submitting') {
        return {
          status: 'error',
          values: state.values,
          error: event.error,
        };
      }
      return warnNoTransition(state, event);
    }

    case 'RESET': {
      // RESET is valid from any state
      return { status: 'idle' };
    }

    default: {
      // TypeScript will error here if any event type is unhandled above.
      // assertNever narrows `event` to `never` — if this compiles, all cases are covered.
      return assertNever(event, `editableFormReducer: unhandled event type`);
    }
  }
}

// ---------------------------------------------------------------------------
// Selector helpers (pure functions over state)
// ---------------------------------------------------------------------------

/** Returns true if the form is in a state where the submit button should be enabled. */
export function canSubmit(state: EditableFormState): boolean {
  return state.status === 'editing';
}

/** Returns true if the form is in a loading/async state. */
export function isLoading(state: EditableFormState): boolean {
  return state.status === 'validating' || state.status === 'submitting';
}

/** Returns validation errors for a specific field, or empty array if none. */
export function getFieldErrors(
  state: EditableFormState,
  fieldId: string,
): string[] {
  if (state.status !== 'editing') return [];
  return state.validationErrors
    .filter(e => e.fieldId === fieldId)
    .map(e => e.message);
}

/** Returns all form-level (non-field) validation errors. */
export function getFormErrors(state: EditableFormState): string[] {
  if (state.status !== 'editing') return [];
  return state.validationErrors.filter(e => !e.fieldId).map(e => e.message);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function warnNoTransition(
  state: EditableFormState,
  event: EditableFormEvent,
): EditableFormState {
  if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
    console.warn(
      `[editable-form] No transition from "${state.status}" on event "${event.type}". Ignoring.`,
    );
  }
  return state;
}
