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
}

// ---------------------------------------------------------------------------
// CliOutput (matches output-schema.json)
// ---------------------------------------------------------------------------

export interface CliOutput {
  outputVersion: '1.0.0';
  command: 'validate' | 'audit-tokens' | 'scaffold';
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

/** Emit JSON output to stdout and return the exit code. */
export function emitOutput(output: CliOutput): number {
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  return output.exitCode;
}
