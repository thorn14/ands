/**
 * @module @ands/editable-form-example
 * @description Feature Lab example: User Profile editable form.
 *
 * **Portability proof:**
 * - Intent extends editable-form schema (not modifying it)
 * - UI uses ds-adapter-example (not preset primitives directly)
 * - `ands validate ./dist/intent.js` exits with code 0
 * - `ands audit-tokens` yields zero violations or explicitly allowlisted items
 *
 * **Tier:** Feature Lab (Flexible) — may import Interaction Kit + adapters.
 */

export { intent } from './intent.js';
export { reducer, createInitialState, canSubmit, isLoading } from './reducer.js';
export type { FormState, FormEvent } from './reducer.js';
