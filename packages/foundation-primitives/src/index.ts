/**
 * @module @ands/foundation-primitives
 * @description Portable primitive contracts for the Agent-Native Design System.
 *
 * **Boundary rule (Foundation — Rigid):**
 * This package must NOT import from `@ands/interaction-kit` or Feature Lab.
 *
 * | Export                         | Purpose                                          |
 * |--------------------------------|--------------------------------------------------|
 * | `ButtonProps`                  | Discriminated union requiring an accessible name |
 * | `ButtonContract`               | Interface DS adapters must satisfy               |
 * | `validateButtonAccessibility`  | Runtime a11y prop validator                      |
 * | `InputProps`                   | Discriminated union requiring an accessible name |
 * | `InputContract`                | Interface DS adapters must satisfy               |
 * | `validateInputAccessibility`   | Runtime a11y prop validator                      |
 *
 * **A11y contract model:**
 * Contracts use discriminated union types so that agents cannot accidentally
 * create unlabeled interactive elements. TypeScript enforces at compile time.
 * Runtime helpers are provided for CLI audit use cases.
 */

export type {
  ButtonProps,
  ButtonContract,
  ButtonVariant,
  ButtonSize,
} from './button.js';
export { validateButtonAccessibility } from './button.js';

export type {
  InputProps,
  InputContract,
  InputType,
  InputSize,
} from './input.js';
export { validateInputAccessibility } from './input.js';
