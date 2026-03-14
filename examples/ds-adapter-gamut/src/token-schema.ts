/**
 * @module token-schema
 * @description Zod schemas for the gamut-all JSON input format.
 *
 * gamut-all produces semantic surface-based tokens (bgBrand, fgPrimary, etc.)
 * from a declarative input JSON that specifies color ramps, themes, and surfaces.
 *
 * Agents: validate gamut input with `ands run compliance <file>` — do not parse manually.
 *
 * @see https://github.com/thorn14/gamut-all
 */

import { z } from 'zod';
import { strictObject } from '@ands/contracts';

// ---------------------------------------------------------------------------
// Color ramp
// ---------------------------------------------------------------------------

const gamutRampStepSchema = strictObject({
  step: z.number().int().min(0).max(1000),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a 6-digit hex color'),
  luminance: z.number().min(0).max(1).optional(),
});

const gamutRampSchema = strictObject({
  name: z.string().min(1),
  steps: z.array(gamutRampStepSchema).min(2),
});

// ---------------------------------------------------------------------------
// Themes (light / dark)
// ---------------------------------------------------------------------------

/** Maps theme name → { ramp name → step number } */
const gamutThemesSchema = z.record(z.string(), z.record(z.string(), z.number().int()));

// ---------------------------------------------------------------------------
// Surfaces (semantic token assignments)
// ---------------------------------------------------------------------------

/** Ramp reference format: "rampName.step" e.g. "neutral.0", "blue.500" */
const rampRefSchema = z.string().min(1);

const gamutSurfaceSchema = strictObject({
  /** Background: ramp reference "rampName.step" (per-theme overridable) */
  bg: rampRefSchema.optional(),
  /** Foreground: ramp reference "rampName.step" */
  fg: rampRefSchema.optional(),
  /** Border: ramp reference "rampName.step" (per-theme overridable) */
  border: rampRefSchema.optional(),
  /** Per-theme overrides for bg, fg, border (same ramp ref format) */
  themes: z
    .record(
      z.string(),
      z.object({
        bg: rampRefSchema.optional(),
        fg: rampRefSchema.optional(),
        border: rampRefSchema.optional(),
      }),
    )
    .optional(),
});

const gamutSurfacesSchema = z.record(z.string(), gamutSurfaceSchema);

// ---------------------------------------------------------------------------
// Compliance config
// ---------------------------------------------------------------------------

const gamutComplianceSchema = strictObject({
  /** WCAG 2.1 level. @default 'AA' */
  level: z.enum(['A', 'AA', 'AAA']).default('AA'),
  /** Contrast algorithm. @default 'wcag21' */
  engine: z.enum(['wcag21', 'apca']).default('wcag21'),
}).partial();

// ---------------------------------------------------------------------------
// Top-level gamut input
// ---------------------------------------------------------------------------

export const gamutTokenInputSchema = strictObject({
  /** Version of the gamut-all schema format. */
  version: z.string().default('1.0.0'),
  /** Color ramps (palettes). At least one required. */
  ramps: z.array(gamutRampSchema).min(1),
  /** Theme definitions mapping ramp steps per theme. */
  themes: gamutThemesSchema.optional(),
  /** Semantic surface definitions. */
  surfaces: gamutSurfacesSchema.optional(),
  /** Compliance settings. */
  compliance: gamutComplianceSchema.optional(),
});

export type GamutTokenInput = z.infer<typeof gamutTokenInputSchema>;
export type GamutRamp = z.infer<typeof gamutRampSchema>;
export type GamutRampStep = z.infer<typeof gamutRampStepSchema>;

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

import type { Result } from '@ands/contracts';
import { ok, err } from '@ands/contracts';
import type { ZodError } from 'zod';

/**
 * Validate a raw object against the gamut token input schema.
 * Returns `ok(input)` or `err(zodError)`.
 */
export function validateGamutInput(data: unknown): Result<GamutTokenInput, ZodError> {
  const result = gamutTokenInputSchema.safeParse(data);
  return result.success ? ok(result.data) : err(result.error);
}
