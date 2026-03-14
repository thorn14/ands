/**
 * @module validator
 * @description DTCG token file validator.
 *
 * Returns a `Result` — never throws for expected failures.
 * Catches: invalid names, unsupported types, missing $value, wrong value types.
 *
 * @example
 * ```ts
 * const result = validateTokenGroup(myTokens);
 * if (!result.ok) {
 *   result.error.forEach(e => console.error(e.path, e.message));
 * }
 * ```
 */

import { ok, err, type Result } from '@ands/contracts';
import { isValidTokenName, SUPPORTED_TOKEN_TYPES, type TokenGroup } from './schema.js';

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export interface TokenValidationError {
  /** Dot-separated path to the offending token/group. */
  path: string;
  /** Human-readable description of the problem. */
  message: string;
  /** Machine-readable error code. */
  code: TokenValidationErrorCode;
}

export type TokenValidationErrorCode =
  | 'INVALID_NAME'
  | 'UNSUPPORTED_TYPE'
  | 'MISSING_VALUE'
  | 'INVALID_VALUE_TYPE'
  | 'RESERVED_KEY_CONFLICT';

// ---------------------------------------------------------------------------
// DTCG metadata keys — these are allowed at any level
// ---------------------------------------------------------------------------

const DTCG_META_KEYS = new Set(['$type', '$value', '$description', '$extensions']);

// ---------------------------------------------------------------------------
// Core validator
// ---------------------------------------------------------------------------

/**
 * Validate a token group (or full token file) against ANDS DTCG constraints.
 *
 * @param group - The raw token object (parsed from JSON or imported as TS).
 * @param parentPath - Used internally for recursive traversal.
 * @returns `Ok<true>` if valid, `Err<TokenValidationError[]>` if not.
 */
export function validateTokenGroup(
  group: unknown,
  parentPath = '',
): Result<true, TokenValidationError[]> {
  const errors: TokenValidationError[] = [];
  traverseGroup(group, parentPath, errors);
  return errors.length === 0 ? ok(true) : err(errors);
}

function traverseGroup(node: unknown, path: string, errors: TokenValidationError[]): void {
  if (typeof node !== 'object' || node === null || Array.isArray(node)) {
    errors.push({
      path,
      message: `Expected an object, got ${Array.isArray(node) ? 'array' : typeof node}`,
      code: 'INVALID_VALUE_TYPE',
    });
    return;
  }

  const obj = node as Record<string, unknown>;

  // Check if this is a leaf token (has $value)
  if ('$value' in obj) {
    validateLeaf(obj, path, errors);
    return;
  }

  // It's a group — validate metadata keys and recurse into children
  for (const [key, value] of Object.entries(obj)) {
    // DTCG metadata keys are allowed at group level
    if (key === '$type') {
      if (typeof value !== 'string' || !SUPPORTED_TOKEN_TYPES.includes(value as never)) {
        errors.push({
          path: path ? `${path}.$type` : '$type',
          message: `Unsupported $type "${String(value)}". Supported: ${SUPPORTED_TOKEN_TYPES.join(', ')}`,
          code: 'UNSUPPORTED_TYPE',
        });
      }
      continue;
    }

    if (DTCG_META_KEYS.has(key)) {
      // $description, $extensions — always valid at group level
      continue;
    }

    // Child key: must follow naming constraints
    if (!isValidTokenName(key)) {
      errors.push({
        path: path ? `${path}.${key}` : key,
        message: `Invalid token name "${key}". Must be lowercase alphanumeric with hyphens/underscores only; must not start with "$", contain "." or "{}"`,
        code: 'INVALID_NAME',
      });
      continue;
    }

    const childPath = path ? `${path}.${key}` : key;
    traverseGroup(value, childPath, errors);
  }
}

function validateLeaf(
  leaf: Record<string, unknown>,
  path: string,
  errors: TokenValidationError[],
): void {
  const value = leaf['$value'];
  if (value === undefined || value === null) {
    errors.push({ path, message: '$value is required on token leaves', code: 'MISSING_VALUE' });
    return;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    errors.push({
      path,
      message: `$value must be a string or number, got ${typeof value}`,
      code: 'INVALID_VALUE_TYPE',
    });
  }

  if ('$type' in leaf) {
    const type = leaf['$type'];
    if (typeof type !== 'string' || !SUPPORTED_TOKEN_TYPES.includes(type as never)) {
      errors.push({
        path: `${path}.$type`,
        message: `Unsupported $type "${String(type)}". Supported: ${SUPPORTED_TOKEN_TYPES.join(', ')}`,
        code: 'UNSUPPORTED_TYPE',
      });
    }
  }

  // Check for unexpected keys
  for (const key of Object.keys(leaf)) {
    if (!DTCG_META_KEYS.has(key)) {
      errors.push({
        path: `${path}.${key}`,
        message: `Unknown key "${key}" on token leaf. Only DTCG meta keys ($value, $type, $description, $extensions) are allowed.`,
        code: 'RESERVED_KEY_CONFLICT',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Flatten helpers (used by build step)
// ---------------------------------------------------------------------------

/**
 * Flatten a nested token group into a flat record of path → value.
 * Inherits `$type` from parent groups.
 */
export function flattenTokens(
  group: TokenGroup,
  prefix = '',
): Record<string, { value: string | number; type?: string }> {
  const result: Record<string, { value: string | number; type?: string }> = {};
  const inheritedType = typeof group['$type'] === 'string' ? group['$type'] : undefined;

  for (const [key, val] of Object.entries(group)) {
    if (key.startsWith('$')) continue; // skip DTCG metadata

    const path = prefix ? `${prefix}.${key}` : key;

    if (
      typeof val === 'object' &&
      val !== null &&
      !Array.isArray(val) &&
      '$value' in (val as object)
    ) {
      // Leaf token
      const leaf = val as { $value: string | number; $type?: string };
      const resolvedType = leaf.$type ?? inheritedType;
      result[path] = {
        value: leaf.$value,
        ...(resolvedType !== undefined ? { type: resolvedType } : {}),
      };
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      // Nested group — recurse
      const nested = flattenTokens(val as TokenGroup, path);
      Object.assign(result, nested);
    }
  }

  return result;
}
