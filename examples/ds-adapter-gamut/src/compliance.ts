/**
 * @module compliance
 * @description WCAG/APCA compliance checking for gamut-all tokens.
 *
 * Checks that all surface token pairs (background + foreground) meet
 * the configured contrast level (AA by default).
 *
 * Maps failures to ANDS Issue format so the `ands run compliance` command
 * can emit standard JSON output.
 */

import type { Issue } from '@ands/ands-cli';
import type { GamutTokenInput } from './token-schema.js';
import { buildGamutTokenIndex } from './token-map.js';

// ---------------------------------------------------------------------------
// Contrast calculation (simplified WCAG 2.1)
// ---------------------------------------------------------------------------

/** Parse hex color to relative luminance (WCAG 2.1 formula) */
function hexToLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const linearize = (c: number): number =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ---------------------------------------------------------------------------
// Required contrast ratios per WCAG level
// ---------------------------------------------------------------------------

const WCAG_RATIOS: Record<string, number> = {
  A: 3.0,
  AA: 4.5,
  AAA: 7.0,
};

// ---------------------------------------------------------------------------
// Compliance checker
// ---------------------------------------------------------------------------

export interface ComplianceOptions {
  level?: 'A' | 'AA' | 'AAA';
  theme?: string;
}

/**
 * Check all surface token pairs for WCAG contrast compliance.
 * Returns ANDS Issue[] for any failures — empty array means all pass.
 */
export function runGamutCompliance(
  input: GamutTokenInput,
  options: ComplianceOptions = {},
): Issue[] {
  const level = options.level ?? input.compliance?.level ?? 'AA';
  const theme = options.theme ?? 'light';
  const required = WCAG_RATIOS[level] ?? 4.5;

  const tokenIndex = buildGamutTokenIndex(input, theme);
  const issues: Issue[] = [];

  // Check each surface that has both bg and fg resolved
  for (const [surfaceName] of Object.entries(input.surfaces ?? {})) {
    const bgHex = tokenIndex[`semantic.bg-${surfaceName}`] as string | undefined;
    const fgHex = tokenIndex[`semantic.fg-${surfaceName}`] as string | undefined;

    if (!bgHex || !fgHex) continue;
    if (!bgHex.startsWith('#') || !fgHex.startsWith('#')) continue;

    const ratio = contrastRatio(bgHex, fgHex);

    if (ratio < required) {
      issues.push({
        category: 'compliance',
        code: 'WCAG_CONTRAST_FAILURE',
        message:
          `Surface "${surfaceName}" (theme: ${theme}) has contrast ratio ${ratio.toFixed(2)}:1 ` +
          `— below WCAG ${level} minimum of ${required}:1`,
        hint:
          `Adjust the foreground or background step for "${surfaceName}" to achieve ≥${required}:1. ` +
          `Current: bg=${bgHex}, fg=${fgHex}`,
        path: [`surfaces.${surfaceName}`],
      });
    }
  }

  return issues;
}
