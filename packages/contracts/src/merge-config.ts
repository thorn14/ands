/**
 * @module merge-config
 * @description `mergeConfig()` — deep merge for AndsConfig with array concatenation and exclusions.
 *
 * Merge rules:
 * - Scalar: consumer wins over preset wins over defaults
 * - Array (`plugins`, `adapters`, `content`, `upstreams`): always merged, never replaced
 * - Nested object (`enforcement`, `narrative`): deep merged, consumer wins on leaf scalars
 * - Array exclusion: `{ exclude: 'name' }` entries filter after merge
 */

import type { AndsConfig, ExcludeDirective } from './config.js';

function isExcludeDirective(item: unknown): item is ExcludeDirective {
  return (
    typeof item === 'object' &&
    item !== null &&
    'exclude' in item &&
    typeof (item as ExcludeDirective).exclude === 'string'
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMergeObjects(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overrideVal = override[key];

    if (overrideVal === undefined) continue;

    if (isPlainObject(baseVal) && isPlainObject(overrideVal)) {
      result[key] = deepMergeObjects(baseVal, overrideVal);
    } else {
      result[key] = overrideVal;
    }
  }
  return result;
}

/** Fields that use array concatenation (not replacement). */
const ARRAY_FIELDS = new Set(['plugins', 'adapters', 'content', 'presets']);
const NESTED_ARRAY_PATHS: Record<string, string[]> = {
  'mcp.upstreams': ['mcp', 'upstreams'],
};

function getNestedValue(obj: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (!isPlainObject(current)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function setNestedValue(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    if (!isPlainObject(current[key])) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[path[path.length - 1]!] = value;
}

function getItemName(item: unknown): string | undefined {
  if (isPlainObject(item) && typeof (item as Record<string, unknown>)['name'] === 'string') {
    return (item as Record<string, unknown>)['name'] as string;
  }
  if (typeof item === 'string') return item;
  return undefined;
}

function applyExclusions<T>(items: T[]): T[] {
  const excludeNames = new Set<string>();
  for (const item of items) {
    if (isExcludeDirective(item)) {
      excludeNames.add(item.exclude);
    }
  }
  if (excludeNames.size === 0) return items;

  return items.filter(item => {
    if (isExcludeDirective(item)) return false;
    const name = getItemName(item);
    return name === undefined || !excludeNames.has(name);
  });
}

/**
 * Merge two AndsConfig objects.
 *
 * - Scalars: `override` wins
 * - Arrays (`plugins`, `adapters`, `content`, `presets`, `mcp.upstreams`): concatenated
 * - Nested objects (`enforcement`, `narrative`, `mcp`, `council`): deep merged
 * - `{ exclude: 'name' }` entries in arrays filter after merge
 */
export function mergeConfig(base: Partial<AndsConfig>, override: Partial<AndsConfig>): AndsConfig {
  const result: Record<string, unknown> = {};

  // Collect all keys from both
  const allKeys = new Set([...Object.keys(base), ...Object.keys(override)]);

  for (const key of allKeys) {
    const baseVal = (base as Record<string, unknown>)[key];
    const overrideVal = (override as Record<string, unknown>)[key];

    if (overrideVal === undefined) {
      result[key] = baseVal;
      continue;
    }

    if (baseVal === undefined) {
      result[key] = overrideVal;
      continue;
    }

    if (ARRAY_FIELDS.has(key)) {
      // Array concatenation
      const baseArr = Array.isArray(baseVal) ? baseVal : [];
      const overrideArr = Array.isArray(overrideVal) ? overrideVal : [];
      result[key] = applyExclusions([...baseArr, ...overrideArr]);
    } else if (isPlainObject(baseVal) && isPlainObject(overrideVal)) {
      // Deep merge nested objects
      result[key] = deepMergeObjects(baseVal, overrideVal);
    } else {
      // Scalar: override wins
      result[key] = overrideVal;
    }
  }

  // Handle nested array paths (mcp.upstreams)
  for (const [, path] of Object.entries(NESTED_ARRAY_PATHS)) {
    const baseArr = getNestedValue(base as Record<string, unknown>, path);
    const overrideArr = getNestedValue(override as Record<string, unknown>, path);
    if (Array.isArray(baseArr) || Array.isArray(overrideArr)) {
      const merged = applyExclusions([
        ...(Array.isArray(baseArr) ? baseArr : []),
        ...(Array.isArray(overrideArr) ? overrideArr : []),
      ]);
      setNestedValue(result, path, merged);
    }
  }

  return result as AndsConfig;
}
