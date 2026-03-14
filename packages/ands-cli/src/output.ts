/**
 * @module output
 * @description CLI output types and factories matching `output-schema.json`.
 *
 * All commands return a `CliOutput` object that is JSON-serialized to stdout.
 * No prose is ever written to stdout — only the JSON object.
 */

import type { ExitCode } from './exit-codes.js';

// ---------------------------------------------------------------------------
// Issue (matches output-schema.json #/$defs/Issue)
// ---------------------------------------------------------------------------

export type IssueCategory =
  | 'load'
  | 'export'
  | 'schema'
  | 'contract'
  | 'token'
  | 'scaffold'
  | 'plugin'
  | 'compliance'
  | 'internal';

export interface IssueLoc {
  file: string;
  line?: number;
  col?: number;
}

export interface Issue {
  category: IssueCategory;
  code: string;
  message: string;
  path?: string[];
  loc?: IssueLoc;
  hint?: string;
  /**
   * Concrete next CLI command for the agent to run as a recovery step.
   * Agents: execute this directly. Unlike `hint`, this is always a runnable command.
   * @example "ands schema validate"
   * @example "ands scaffold --pattern editable-form --output ./src/my-form --name my-form"
   */
  suggestion?: string;
}

// ---------------------------------------------------------------------------
// CliOutput (matches output-schema.json)
// ---------------------------------------------------------------------------

export interface CliOutput {
  outputVersion: '1.0.0';
  command: 'validate' | 'audit-tokens' | 'scaffold' | 'schema' | 'run';
  file?: string;
  ok: boolean;
  exitCode: ExitCode;
  summary: string;
  issues: Issue[];
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

export const OUTPUT_VERSION = '1.0.0' as const;

export function makeOutput(
  command: CliOutput['command'],
  ok: boolean,
  exitCode: ExitCode,
  summary: string,
  issues: Issue[],
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
export function emitIssueNdjson(issue: Issue): void {
  process.stdout.write(JSON.stringify(issue) + '\n');
}
