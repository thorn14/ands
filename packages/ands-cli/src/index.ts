/**
 * @module @ands/ands-cli
 * @description ANDS Governor CLI — validate, audit, and scaffold.
 *
 * **Boundary rule (CLI — Core):**
 * - MAY import from `@ands/contracts` and `@ands/interaction-kit`
 * - Must NOT import from Feature Lab or specific DS adapters
 *
 * **CLI Usage (agents):**
 * ```bash
 * # Validate an intent file
 * ands validate ./src/intent.js
 *
 * # Audit for hardcoded token values
 * ands audit-tokens
 *
 * # Scaffold a new feature
 * ands scaffold --pattern editable-form --output ./src/features/my-form --name my-form
 * ```
 *
 * All commands emit JSON to stdout. Parse output with `| jq .`
 *
 * **Programmatic API:**
 * These exports allow adapters and build scripts to call commands directly.
 */

export { runCli } from './cli.js';
export { runValidate } from './commands/validate.js';
export { runAuditTokens } from './commands/audit-tokens.js';
export type { AuditConfig } from '@ands/contracts';
export { runScaffold } from './commands/scaffold.js';
export type { ScaffoldOptions } from './commands/scaffold.js';
export { runSchema } from './commands/schema.js';
export { ExitCode, EXIT_CODE_DESCRIPTIONS } from './exit-codes.js';
export type { ExitCode as ExitCodeType } from './exit-codes.js';
export { makeOutput, emitOutput, emitIssueNdjson, OUTPUT_VERSION } from './output.js';
export type { CliOutput, Issue, IssueCategory, IssueLoc } from './output.js';
export { loadConfig } from './config.js';
export type { AndsConfig } from './config.js';
export { buildRegistry } from './registry.js';
export type { RuntimeRegistry } from './registry.js';
