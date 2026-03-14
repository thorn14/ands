/**
 * @module @ands/ds-adapter-gamut
 * @description ANDS adapter for gamut-all — surface-based semantic tokens with WCAG/APCA compliance.
 *
 * **Quick start:**
 * ```ts
 * // ands.config.ts
 * import { gamutPlugin } from '@ands/ds-adapter-gamut';
 * export default { plugins: [gamutPlugin] };
 * ```
 *
 * **Agent governor loop with gamut:**
 * ```bash
 * ands validate ./src/intent.js           # intent valid?
 * ands run test src/gamut-tokens.json     # tokens internally consistent?
 * ands run compliance src/gamut-tokens.json  # WCAG AA pass?
 * ands audit-tokens                        # no hardcoded values?
 * ```
 *
 * **Boundary rule (Adapter — DS-specific):**
 * - MAY import Foundation + Interaction Kit + @ands/ands-cli
 * - Must NOT import from Feature Lab examples
 * - @gamut-all/core is a peer dependency (optional)
 */

// Plugin export (register in ands.config.ts)
export { gamutPlugin } from './plugin.js';
export { complianceCommand } from './commands/compliance.js';
export { testCommand } from './commands/test.js';

// Token system
export { gamutTokenInputSchema, validateGamutInput } from './token-schema.js';
export type { GamutTokenInput, GamutRamp, GamutRampStep } from './token-schema.js';
export { buildGamutTokenIndex, gamutCssVar, tokenVar } from './token-map.js';

// Compliance
export { runGamutCompliance } from './compliance.js';
export type { ComplianceOptions } from './compliance.js';

// Components
export { Button } from './components/button.js';
export { Input } from './components/input.js';

// Audit config
export { gamutAuditConfig } from './audit-config.js';
