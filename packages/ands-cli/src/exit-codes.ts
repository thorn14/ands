/**
 * @module exit-codes
 * @description Stable exit code mapping for ANDS CLI commands.
 *
 * **Agents:** check `exitCode` in the JSON output, not the process exit code directly.
 * The exit code is duplicated in the JSON for convenience.
 *
 * | Code | Constant              | Meaning                                           |
 * |------|-----------------------|---------------------------------------------------|
 * | 0    | Success               | Command completed without errors                  |
 * | 1    | ModuleLoadFailure     | The intent file could not be imported             |
 * | 2    | IntentExportInvalid   | No `intent` export, or export has wrong shape     |
 * | 3    | SchemaParseFailure    | Zod schema parse failed (intent has invalid data) |
 * | 4    | ContractRuleFailure   | Non-Zod structural constraint violated            |
 * | 5    | InternalError         | Unexpected error in the CLI itself                |
 *
 * For `audit-tokens`:
 * | 0    | Success               | No violations found                               |
 * | 4    | ContractRuleFailure   | Off-system hardcoded values detected              |
 *
 * For `scaffold`:
 * | 0    | Success               | Files generated successfully                      |
 * | 4    | ContractRuleFailure   | Output directory already exists (use --force)     |
 */

export const ExitCode = {
  Success: 0,
  ModuleLoadFailure: 1,
  IntentExportInvalid: 2,
  SchemaParseFailure: 3,
  ContractRuleFailure: 4,
  InternalError: 5,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];

export const EXIT_CODE_DESCRIPTIONS: Record<ExitCode, string> = {
  [ExitCode.Success]: 'Command completed successfully',
  [ExitCode.ModuleLoadFailure]: 'Intent module could not be loaded (check the path and syntax)',
  [ExitCode.IntentExportInvalid]: 'Module does not export a valid intent object',
  [ExitCode.SchemaParseFailure]: 'Intent failed Zod schema validation',
  [ExitCode.ContractRuleFailure]: 'Intent or tokens violate a structural contract rule',
  [ExitCode.InternalError]: 'Unexpected internal CLI error',
};
