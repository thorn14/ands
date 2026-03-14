/**
 * @module plugin
 * @description The gamut-all AndsPlugin export.
 *
 * Import this in your project's `ands.config.ts` to enable gamut commands:
 *
 * ```ts
 * // ands.config.ts
 * import { gamutPlugin } from '@ands/ds-adapter-gamut';
 * export default {
 *   adapter: '@ands/ds-adapter-gamut',
 *   plugins: [gamutPlugin],
 * };
 * ```
 *
 * This adds to the ANDS CLI:
 * - `ands run compliance <file>` — WCAG contrast checker
 * - `ands run test [file]` — token consistency tests
 *
 * gamut does NOT add new interaction patterns (editable-form still works as-is).
 * It adapts the existing patterns to use surface-based semantic tokens.
 */

import type { AndsPlugin } from '@ands/contracts';
import { complianceCommand } from './commands/compliance.js';
import { testCommand } from './commands/test.js';

export const gamutPlugin: AndsPlugin = {
  name: '@ands/ds-adapter-gamut',
  patterns: [], // gamut adapts existing patterns, not new ones
  commands: [complianceCommand, testCommand],
};
