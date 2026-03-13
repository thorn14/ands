/**
 * @module @ands/interaction-kit
 * @description Reusable UX flow patterns as Zod schemas and TypeScript state machines.
 *
 * **Agent start here:**
 * 1. Read `src/manifest.ts` — discover available patterns and their entrypoints.
 * 2. Read the pattern schema (e.g. `src/editable-form/schema.ts`) — understand intent shape.
 * 3. Write your intent file implementing the schema.
 * 4. Run `ands validate <intent-file>` — parse JSON output, fix issues, repeat.
 *
 * **Boundary rule (Interaction Kit — Structural):**
 * - MAY import from `@ands/contracts` and `@ands/foundation-tokens`
 * - Must NOT import from Feature Lab or any specific DS adapter
 *
 * | Export                     | Purpose                                            |
 * |----------------------------|----------------------------------------------------|
 * | `PATTERN_MANIFEST`         | Navigation index — agent reads this first          |
 * | `findPattern`              | Look up pattern by ID                              |
 * | `editableFormIntentSchema` | Zod schema for `ands validate`                     |
 * | `EditableFormIntent`       | TypeScript type for intent objects                 |
 * | `editableFormReducer`      | Pure reducer — (state, event) → state              |
 * | `createInitialState`       | Factory for initial idle state                     |
 * | `canSubmit` / `isLoading`  | State selector helpers                             |
 * | State/Event types          | `EditableFormState`, `EditableFormEvent`, etc.     |
 */

// Manifest
export { PATTERN_MANIFEST, PATTERN_IDS, findPattern } from './manifest.js';
export type { PatternManifestEntry } from './manifest.js';

// Editable Form — Schema
export {
  editableFormIntentSchema,
  fieldSchema,
  formLogicSchema,
  formLayoutSchema,
  FIELD_TYPES,
} from './editable-form/schema.js';
export type {
  EditableFormIntent,
  FieldDefinition,
  FormLogic,
  FormLayout,
  FieldType,
} from './editable-form/schema.js';

// Editable Form — State Machine
export {
  createInitialState,
} from './editable-form/state-machine.js';
export type {
  EditableFormState,
  EditableFormEvent,
  IdleState,
  EditingState,
  ValidatingState,
  SubmittingState,
  SuccessState,
  ErrorState,
  StartEditEvent,
  FieldChangeEvent,
  SubmitEvent,
  ValidationSuccessEvent,
  ValidationFailureEvent,
  SubmitSuccessEvent,
  SubmitFailureEvent,
  ResetEvent,
  ValidationError,
  SubmitError,
  EffectDispatch,
} from './editable-form/state-machine.js';

// Editable Form — Reducer
export {
  editableFormReducer,
  canSubmit,
  isLoading,
  getFieldErrors,
  getFormErrors,
} from './editable-form/reducer.js';
