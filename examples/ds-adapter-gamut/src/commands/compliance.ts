/**
 * @module commands/compliance
 * @description Plugin command: `ands run compliance <file>`
 *
 * Validates gamut-all token input and runs WCAG contrast compliance checks.
 * Emits ANDS JSON to stdout — agents parse this, not prose.
 *
 * **Agent loop:**
 * ```bash
 * ands run compliance src/gamut-tokens.json
 * # { ok: true, exitCode: 0 } = all surfaces pass WCAG AA
 * # { ok: false, issues: [...] } = fix the flagged surface token pairs
 * ```
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { makeOutput, emitOutput, ExitCode } from '@ands/ands-cli';
import type { PluginCommand } from '@ands/contracts';
import { validateGamutInput } from '../token-schema.js';
import { runGamutCompliance } from '../compliance.js';

async function runCompliance(args: string[]): Promise<number> {
  const filePath = args[0];

  if (!filePath) {
    return emitOutput(
      makeOutput(
        'run',
        false,
        ExitCode.ContractRuleFailure,
        'Usage: ands run compliance <gamut-tokens.json>',
        [
          {
            category: 'plugin',
            code: 'MISSING_ARGUMENT',
            message: 'Path to gamut token input JSON is required',
            hint: 'Pass the path to your gamut-tokens.json file.',
            suggestion: 'ands run compliance src/gamut-tokens.json',
          },
        ],
      ),
    );
  }

  const absPath = resolve(filePath);

  // Load JSON
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(absPath, 'utf8'));
  } catch (e) {
    return emitOutput(
      makeOutput(
        'run',
        false,
        ExitCode.ModuleLoadFailure,
        `Could not load gamut token file: ${String(e instanceof Error ? e.message : e)}`,
        [
          {
            category: 'load',
            code: 'TOKEN_FILE_MISSING',
            message: String(e instanceof Error ? e.message : e),
            hint: 'Ensure the file exists and is valid JSON.',
          },
        ],
      ),
    );
  }

  // Validate schema
  const parseResult = validateGamutInput(raw);
  if (!parseResult.ok) {
    const issues = parseResult.error.issues.map(issue => ({
      category: 'schema' as const,
      code: 'GAMUT_SCHEMA_FAILURE',
      message: issue.message,
      path: issue.path.map(p => String(p)),
      hint: issue.path.length > 0
        ? `Fix the value at path: ${issue.path.join('.')}`
        : 'Fix the top-level gamut token object structure.',
    }));
    return emitOutput(
      makeOutput(
        'run',
        false,
        ExitCode.SchemaParseFailure,
        `Gamut token schema validation failed: ${issues.length} error(s)`,
        issues,
        { file: filePath },
      ),
    );
  }

  // Run compliance checks
  const complianceIssues = runGamutCompliance(parseResult.data);

  const ok = complianceIssues.length === 0;
  return emitOutput(
    makeOutput(
      'run',
      ok,
      ok ? ExitCode.Success : ExitCode.ContractRuleFailure,
      ok
        ? `All token surfaces pass WCAG ${parseResult.data.compliance?.level ?? 'AA'} compliance`
        : `${complianceIssues.length} surface(s) fail WCAG ${parseResult.data.compliance?.level ?? 'AA'} compliance`,
      complianceIssues,
      { file: filePath },
    ),
  );
}

export const complianceCommand: PluginCommand = {
  name: 'compliance',
  description: 'Validate gamut-all token surfaces against WCAG contrast requirements',
  run: runCompliance,
};
