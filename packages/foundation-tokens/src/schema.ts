/**
 * @module schema
 * @description DTCG/W3C Design Token Community Group compatible Zod schemas.
 *
 * Supported `$type` values (ANDS subset):
 *   color | dimension | fontFamily | fontWeight | lineHeight |
 *   shadow | number | string | duration | cubicBezier
 *
 * Token file structure:
 * ```json
 * {
 *   "color": {
 *     "brand": {
 *       "primary": { "$type": "color", "$value": "#3B82F6" }
 *     }
 *   }
 * }
 * ```
 *
 * Naming constraints (enforced by validator):
 *   - No `$` prefix in group/token names
 *   - No `.` in names (dots are path separators)
 *   - No `{}` in names (reserved for aliases)
 *   - Lowercase, alphanumeric, hyphens and underscores only
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Supported $type values
// ---------------------------------------------------------------------------

export const SUPPORTED_TOKEN_TYPES = [
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'lineHeight',
  'shadow',
  'number',
  'string',
  'duration',
  'cubicBezier',
] as const;

export type TokenType = (typeof SUPPORTED_TOKEN_TYPES)[number];

export const tokenTypeSchema = z.enum(SUPPORTED_TOKEN_TYPES);

// ---------------------------------------------------------------------------
// Token leaf node
// ---------------------------------------------------------------------------

/**
 * A single design token with `$value` and optional metadata.
 * The `$type` may be omitted if inherited from a parent group.
 */
export const tokenLeafSchema = z
  .object({
    $value: z.union([z.string(), z.number()]),
    $type: tokenTypeSchema.optional(),
    $description: z.string().optional(),
    $extensions: z.record(z.unknown()).optional(),
  })
  .strict();

export type TokenLeaf = z.infer<typeof tokenLeafSchema>;

// ---------------------------------------------------------------------------
// Token naming constraint
// ---------------------------------------------------------------------------

/**
 * Valid token/group name: lowercase alphanumeric, hyphens, underscores.
 * Must not start with `$` (reserved for DTCG metadata keys).
 * Must not contain `.` (path separator) or `{` / `}` (alias syntax).
 */
export const TOKEN_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export function isValidTokenName(name: string): boolean {
  if (name.startsWith('$')) return false;
  if (name.includes('.')) return false;
  if (name.includes('{') || name.includes('}')) return false;
  return TOKEN_NAME_PATTERN.test(name);
}

// ---------------------------------------------------------------------------
// Token group (recursive)
// ---------------------------------------------------------------------------

/**
 * A token group: an object whose keys are either token leaves or nested groups.
 * DTCG metadata keys (`$type`, `$description`, `$extensions`) may appear at
 * group level and are inherited by child tokens.
 */
export type TokenGroup = {
  $type?: TokenType;
  $description?: string;
  $extensions?: Record<string, unknown>;
  [key: string]: TokenLeaf | TokenGroup | TokenType | string | Record<string, unknown> | undefined;
};

// We cannot build a fully recursive Zod schema without z.lazy in a way that
// satisfies exactOptionalPropertyTypes, so we provide a runtime validator
// in validator.ts that traverses the tree. The schema here validates leaves.

export const tokenGroupMetaSchema = z
  .object({
    $type: tokenTypeSchema.optional(),
    $description: z.string().optional(),
    $extensions: z.record(z.unknown()).optional(),
  })
  .passthrough(); // allow child keys (checked recursively in validator)

// ---------------------------------------------------------------------------
// Resolved token index (flat map: path → value)
// ---------------------------------------------------------------------------

/**
 * Flat map produced by the build step.
 * Keys are dot-separated paths (e.g. `"color.brand.primary"`).
 * Values are the resolved scalar values.
 *
 * Used by `ands audit-tokens` to identify off-system hardcoded values.
 */
export type TokenIndex = Record<string, string | number>;

export const tokenIndexSchema = z.record(z.union([z.string(), z.number()]));
