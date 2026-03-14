/**
 * @module token-map
 * @description Maps gamut-all output to the ANDS TokenIndex format.
 *
 * gamut uses surface-based semantic names (bgBrand, fgPrimary, borderSubtle).
 * This module:
 * 1. Resolves all token values for a given theme context
 * 2. Flattens to a `Record<string, string>` (ANDS TokenIndex)
 * 3. Provides helpers for generating `var(--fg-primary)` etc. in components
 */

import type { TokenIndex } from '@ands/foundation-tokens';
import type { GamutTokenInput, GamutRamp } from './token-schema.js';

// ---------------------------------------------------------------------------
// CSS variable naming convention
// ---------------------------------------------------------------------------

/**
 * Maps a gamut semantic name to its CSS custom property.
 * gamut semantic tokens follow kebab-case: bgBrand → --bg-brand
 *
 * @example gamutCssVar('bgBrand')  // '--bg-brand'
 * @example gamutCssVar('fgPrimary') // '--fg-primary'
 */
export function gamutCssVar(semanticName: string): string {
  const kebab = semanticName.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
  return `--${kebab}`;
}

/**
 * Get the CSS `var(...)` expression for a gamut semantic token.
 *
 * @example tokenVar('bgBrand')   // 'var(--bg-brand)'
 * @example tokenVar('fgPrimary') // 'var(--fg-primary)'
 */
export function tokenVar(semanticName: string): string {
  return `var(${gamutCssVar(semanticName)})`;
}

// ---------------------------------------------------------------------------
// Token index builder
// ---------------------------------------------------------------------------

/**
 * Build an ANDS `TokenIndex` from a gamut token input for a given theme.
 *
 * The index is a flat `Record<string, string>` mapping:
 *   `semantic.<semanticName>` → resolved hex value
 *
 * This is what `ands audit-tokens` reads to detect hardcoded values.
 *
 * @param input - Validated gamut token input
 * @param theme - Theme name to resolve (default: first theme, or 'light')
 */
export function buildGamutTokenIndex(
  input: GamutTokenInput,
  theme = 'light',
): TokenIndex {
  const index: TokenIndex = {};

  // Build ramp lookup: ramp name → step → hex
  const rampMap = buildRampMap(input.ramps);

  // Resolve surface tokens (bg, fg, border use explicit "rampName.step" refs)
  for (const [surfaceName, surface] of Object.entries(input.surfaces ?? {})) {
    const themeOverride = surface.themes?.[theme];

    // Background — explicit ramp ref e.g. "neutral.0"
    const bgRef = themeOverride?.bg ?? surface.bg;
    if (bgRef) {
      const hex = resolveRampRef(rampMap, bgRef);
      if (hex) index[`semantic.bg-${surfaceName}`] = hex;
    }

    // Foreground — same format
    const fgRef = themeOverride?.fg ?? surface.fg;
    if (fgRef) {
      const hex = resolveRampRef(rampMap, fgRef);
      if (hex) index[`semantic.fg-${surfaceName}`] = hex;
    }

    // Border — same format
    const borderRef = themeOverride?.border ?? surface.border;
    if (borderRef) {
      const hex = resolveRampRef(rampMap, borderRef);
      if (hex) index[`semantic.border-${surfaceName}`] = hex;
    }
  }

  // Also add all raw ramp values (for audit-tokens to detect any hardcoded hex)
  for (const [rampName, stepMap] of Object.entries(rampMap)) {
    for (const [step, hex] of Object.entries(stepMap)) {
      index[`ramp.${rampName}.${step}`] = hex;
    }
  }

  return index;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type RampMap = Record<string, Record<number, string>>;

function buildRampMap(ramps: GamutRamp[]): RampMap {
  const map: RampMap = {};
  for (const ramp of ramps) {
    map[ramp.name] = {};
    for (const step of ramp.steps) {
      map[ramp.name]![step.step] = step.hex;
    }
  }
  return map;
}

function resolveStep(rampMap: RampMap, rampName: string, step: number): string | undefined {
  return rampMap[rampName]?.[step];
}

/** Parse "rampName.step" and resolve to hex. */
function resolveRampRef(rampMap: RampMap, ref: string): string | undefined {
  const [rampName, stepStr] = ref.split('.');
  const step = parseInt(stepStr ?? '', 10);
  if (rampName === undefined || Number.isNaN(step)) return undefined;
  return resolveStep(rampMap, rampName, step);
}
