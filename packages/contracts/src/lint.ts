/**
 * @module lint
 * @description `AndsLintRule` and `AndsLintContext` — contracts for lint rule plugins.
 *
 * Rules are registered via `AndsPlugin.lintRules` and executed by `ands lint`.
 * Each rule receives source file content and returns `AndsIssue[]` for violations.
 */

import type { AndsIssue } from './cli-output.js';
import type { AndsConfig } from './config.js';
import type { AndsAdapter } from './adapter.js';

/** Context passed to lint rules during execution. */
export interface AndsLintContext {
  /** The fully resolved ANDS configuration. */
  config: AndsConfig;
  /** All loaded adapters (for accessing propConventions, deprecations, etc.). */
  adapters: AndsAdapter[];
  /** The file path being linted. */
  filePath: string;
  /** The file content being linted. */
  content: string;
}

/** A single lint rule contributed by a plugin. */
export interface AndsLintRule {
  /** Rule name (e.g. 'no-raw-token-value'). Must be unique. */
  name: string;
  /** One-line description of what this rule checks. */
  description: string;
  /** Execute the rule against a file. Return issues for violations. */
  create: (context: AndsLintContext) => AndsIssue[];
}
