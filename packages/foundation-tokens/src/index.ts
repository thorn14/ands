/**
 * @module @ands/foundation-tokens
 * @description DTCG/W3C-compatible design token layer.
 *
 * **Boundary rule (Foundation — Rigid):**
 * This package must NOT import from `@ands/interaction-kit` or Feature Lab.
 *
 * | Export               | Layer   | Purpose                                        |
 * |----------------------|---------|------------------------------------------------|
 * | `referenceTokens`    | Preset  | Opinionated reference token set (optional)     |
 * | `validateTokenGroup` | Harness | Validates any DTCG-compatible token object     |
 * | `flattenTokens`      | Harness | Flattens token tree to `path → value` map      |
 * | `tokenTypeSchema`    | Harness | Zod enum of supported DTCG `$type` values      |
 * | Schema types         | Harness | `TokenGroup`, `TokenLeaf`, `TokenIndex`, etc.  |
 *
 * **Build outputs** (emitted by `pnpm build:tokens`):
 * - `dist/tokens.css`        — CSS custom properties
 * - `dist/tokens.ts`         — TypeScript constants
 * - `dist/tokens.index.json` — Flat audit index
 */

export { referenceTokens } from './tokens.js';
export { validateTokenGroup, flattenTokens } from './validator.js';
export type { TokenValidationError, TokenValidationErrorCode } from './validator.js';
export {
  tokenTypeSchema,
  tokenLeafSchema,
  tokenIndexSchema,
  isValidTokenName,
  TOKEN_NAME_PATTERN,
  SUPPORTED_TOKEN_TYPES,
} from './schema.js';
export type { TokenType, TokenLeaf, TokenGroup, TokenIndex } from './schema.js';
