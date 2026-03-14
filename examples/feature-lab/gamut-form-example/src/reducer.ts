/**
 * Reducer for user-profile gamut form.
 * Delegates entirely to the core editable-form reducer.
 */

export {
  editableFormReducer as reducer,
  createInitialState,
  canSubmit,
  isLoading,
  getFieldErrors,
} from '@ands/interaction-kit';

export type {
  EditableFormState as FormState,
  EditableFormEvent as FormEvent,
} from '@ands/interaction-kit';
