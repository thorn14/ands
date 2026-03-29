/**
 * @module output
 * @description CLI output factories and emitters.
 *
 * Types (`CliOutput`, `AndsIssue`, `IssueLoc`, `IssueCategory`) are now
 * defined in `@ands/contracts/src/cli-output.ts`. This module re-exports
 * them and provides the factory helpers (`makeOutput`, `emitOutput`).
 */

// Re-export types from contracts
export type {
  CliOutput,
  AndsIssue as Issue,
  IssueLoc,
  IssueCategory,
} from '@ands/contracts';

import type { CliOutput, AndsIssue } from '@ands/contracts';

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

export const OUTPUT_VERSION = '1.0.0' as const;

export function makeOutput(
  command: string,
  ok: boolean,
  exitCode: number,
  summary: string,
  issues: AndsIssue[],
  extra?: { file?: string; data?: Record<string, unknown> },
): CliOutput {
  return {
    outputVersion: OUTPUT_VERSION,
    command,
    ...(extra?.file !== undefined ? { file: extra.file } : {}),
    ok,
    exitCode,
    summary,
    issues,
    ...(extra?.data !== undefined ? { data: extra.data } : {}),
  };
}

/**
 * Emit output to stdout and return the exit code.
 *
 * - When stdout is a TTY (human terminal): pretty human-readable summary
 * - When stdout is piped (agent/script): compact JSON — zero prose, parse-safe
 * - Override with `ANDS_JSON=1` to force JSON in a TTY (useful for testing)
 */
export function emitOutput(output: CliOutput): number {
  if (process.stdout.isTTY && process.env['ANDS_JSON'] !== '1') {
    const icon = output.ok ? '✓' : '✗';
    const lines: string[] = [`${icon} ${output.summary}`];
    for (const issue of output.issues) {
      const loc = issue.loc ? ` (${issue.loc.file}:${issue.loc.line ?? '?'})` : '';
      lines.push(`  [${issue.code}]${loc} ${issue.message}`);
      if (issue.hint) lines.push(`    hint: ${issue.hint}`);
      if (issue.suggestion) lines.push(`    run:  ${issue.suggestion}`);
    }
    process.stdout.write(lines.join('\n') + '\n');
  } else {
    process.stdout.write(JSON.stringify(output) + '\n');
  }
  return output.exitCode;
}

/**
 * Emit a single Issue as an NDJSON line to stdout (for streaming audit-tokens).
 * Each call writes one JSON object followed by a newline.
 */
export function emitIssueNdjson(issue: AndsIssue): void {
  process.stdout.write(JSON.stringify(issue) + '\n');
}
