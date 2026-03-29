/**
 * @module cli-output
 * @description `CliOutput` and `AndsIssue` — the universal output contract for all ANDS CLI commands.
 *
 * All commands emit `CliOutput` to stdout. Exit codes are stable and documented.
 * Types live here in contracts so that plugins, adapters, and tests can import
 * them without depending on `@ands/ands-cli`.
 */

// ---------------------------------------------------------------------------
// Token index (flat map: path → value)
// ---------------------------------------------------------------------------

/**
 * Flat map produced by the build step.
 * Keys are dot-separated paths (e.g. `"color.brand.primary"`).
 * Values are the resolved scalar values.
 *
 * Used by `ands audit-tokens` to identify off-system hardcoded values.
 */
export type TokenIndex = Record<string, string | number>;

// ---------------------------------------------------------------------------
// Issue categories
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
  | 'internal'
  | 'api'
  | 'data-surface'
  | 'visual'
  | 'adoption'
  | 'narrative'
  | 'council';

// ---------------------------------------------------------------------------
// Triage level
// ---------------------------------------------------------------------------

/** Severity classification for narrative triage. */
export type TriageLevel = 'critical' | 'notable' | 'low' | 'internal' | 'sensitive';

// ---------------------------------------------------------------------------
// Issue location
// ---------------------------------------------------------------------------

export interface IssueLoc {
  file: string;
  line?: number;
  col?: number;
}

// ---------------------------------------------------------------------------
// AndsIssue
// ---------------------------------------------------------------------------

export interface AndsIssue {
  category: IssueCategory;
  code: string;
  message: string;
  path?: string[];
  loc?: IssueLoc;
  hint?: string;
  /**
   * Concrete next CLI command for the agent to run as a recovery step.
   * Agents: execute this directly. Unlike `hint`, this is always a runnable command.
   */
  suggestion?: string;
  severity?: 'error' | 'warn' | 'info';
}

// ---------------------------------------------------------------------------
// CliOutput
// ---------------------------------------------------------------------------

export interface CliOutput {
  outputVersion: string;
  command: string;
  file?: string;
  ok: boolean;
  exitCode: number;
  summary: string;
  issues: AndsIssue[];
  data?: Record<string, unknown>;
}
