/**
 * gamut-form-example — portability proof for the ANDS extension system.
 *
 * Demonstrates:
 * - Same editable-form intent as any other ANDS project
 * - Plugin-declared commands (`ands run compliance`, `ands run test`)
 * - Zero hardcoded token values in styles.css (all gamut surface vars)
 * - ands.config.ts declares gamutPlugin — no core modifications required
 */

export { intent } from './intent.js';
export { reducer, createInitialState, canSubmit, isLoading } from './reducer.js';
