/**
 * @module reducer
 * @description Feature-specific reducer wrapping the core editable-form reducer.
 *
 * For this example, the core reducer is used directly — no custom events needed.
 * If domain-specific events are required, extend here following the exhaustive
 * switch pattern from `@ands/interaction-kit`.
 */

import {
  editableFormReducer,
  createInitialState,
  canSubmit,
  isLoading,
  getFieldErrors,
  getFormErrors,
} from '@ands/interaction-kit';
import type {
  EditableFormState,
  EditableFormEvent,
} from '@ands/interaction-kit';

// Re-export core reducer and helpers for this feature
export { createInitialState, canSubmit, isLoading, getFieldErrors, getFormErrors };
export type { EditableFormState as FormState, EditableFormEvent as FormEvent };

/**
 * User Profile form reducer.
 * Currently delegates entirely to the core reducer.
 *
 * To add domain-specific behavior:
 * ```ts
 * export function reducer(state: FormState, event: FormEvent): FormState {
 *   switch (event.type) {
 *     case 'MY_DOMAIN_EVENT':
 *       return { ...state };
 *     default:
 *       return editableFormReducer(state, event);
 *   }
 * }
 * ```
 */
export const reducer = editableFormReducer;
