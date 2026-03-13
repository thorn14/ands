/**
 * @module assert-never
 * @description Exhaustive switch/match guard.
 *
 * Place in every reducer's `default` branch. TypeScript will error at compile
 * time if any discriminant is unhandled. At runtime this is unreachable.
 *
 * @example
 * ```ts
 * function reduce(state: State, event: Event): State {
 *   switch (event.type) {
 *     case 'START': return { ...state, status: 'active' };
 *     case 'STOP':  return { ...state, status: 'idle' };
 *     default:      return assertNever(event); // ← compile error if case missing
 *   }
 * }
 * ```
 */

/**
 * Asserts that a value is `never`. Throws at runtime with a descriptive message
 * if reached (indicates a logic bug, not user error).
 *
 * @param value - Should be of type `never` at the call site.
 * @param message - Optional custom error message.
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(
    message ?? `assertNever: unhandled discriminant — ${JSON.stringify(value)}`,
  );
}
