/**
 * @module @ands/lint-rules
 * @description Reference plugin: lint rules for ANDS governance.
 *
 * Registers as a top-level command (`ands lint`) and provides five built-in rules:
 * - `no-raw-token-value`: Disallow hardcoded color/dimension values
 * - `no-deprecated-prop`: Disallow deprecated props declared by adapters
 * - `prop-naming-consistency`: Ensure prop names match adapter conventions
 * - `no-hardcoded-string`: Detect untranslated user-facing strings (i18n)
 * - `pii-exposure`: Detect PII patterns in source code
 */

export { lintPlugin } from './plugin.js';
export { noRawTokenValue } from './rules/no-raw-token-value.js';
export { noDeprecatedProp } from './rules/no-deprecated-prop.js';
export { propNamingConsistency } from './rules/prop-naming-consistency.js';
export { noHardcodedString } from './rules/no-hardcoded-string.js';
export { piiExposure } from './rules/pii-exposure.js';
