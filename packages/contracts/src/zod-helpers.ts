/**
 * @module zod-helpers
 * @description Opinionated Zod wrappers for ANDS schemas.
 *
 * All ANDS schemas use `strictObject` by default so that unknown keys are
 * rejected at validation time. This prevents silent intent drift where an
 * agent adds a field that is simply ignored by the validator.
 *
 * Re-exports `z` so consumers can import everything from this module.
 */

export { z } from 'zod';
import { z } from 'zod';

/**
 * Create a strict Zod object schema that rejects unknown keys.
 * Prefer this over `z.object(...)` for all ANDS intent/config schemas.
 *
 * @example
 * const MySchema = strictObject({ name: z.string(), age: z.number() });
 */
export function strictObject<T extends z.ZodRawShape>(
  shape: T,
): z.ZodObject<T, 'strict'> {
  return z.object(shape).strict();
}

/**
 * Non-empty string refinement. Rejects `""`.
 * @example z.string().pipe(nonEmptyString)
 */
export const nonEmptyString = z.string().min(1, 'Must not be empty');

/**
 * Slug/identifier refinement: lowercase letters, digits, hyphens only.
 * Valid: `editable-form`, `user-profile-v2`.
 * Invalid: `EditableForm`, `user_profile`, `form.v2`.
 */
export const identifier = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, 'Must be a lowercase slug (a-z, 0-9, hyphens)');

/**
 * Semantic version string refinement.
 * @example semverString.parse('1.2.3') // ok
 */
export const semverString = z
  .string()
  .regex(/^\d+\.\d+\.\d+/, 'Must be a semver string (e.g. 1.0.0)');

/**
 * Parse and throw a `ZodError` on failure.
 * **Only use in build scripts / tests.** CLI code must use `safeParse`.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}
