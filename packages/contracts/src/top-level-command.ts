/**
 * @module top-level-command
 * @description `TopLevelCommand` — the extension interface for `ands <command>` registration.
 *
 * Plugins register top-level commands that the CLI dispatcher routes to directly
 * (e.g. `ands lint`, `ands docs`), as opposed to `ands run <name>` plugin commands.
 *
 * Built-in commands (init, validate, audit-tokens, scaffold, schema) take precedence.
 * A plugin cannot override a built-in command name.
 */

import type { CliOutput } from './cli-output.js';

/** Parsed CLI arguments passed to a top-level command handler. */
export interface ParsedArgs {
  /** Raw arguments after the command name. */
  raw: string[];
  /** Named flags extracted from args (e.g. --port 3333 → { port: '3333' }). */
  flags: Record<string, string | boolean>;
}

/**
 * A top-level CLI command registered by a plugin.
 *
 * @example
 * ```ts
 * const lintCommand: TopLevelCommand = {
 *   name: 'lint',
 *   description: 'Run ESLint + stylelint with ANDS governance rules',
 *   handler: async (args, config) => {
 *     // ... run lint logic ...
 *     return { outputVersion: '1.0.0', command: 'lint', ok: true, exitCode: 0, summary: '...', issues: [] };
 *   },
 * };
 * ```
 */
export interface TopLevelCommand {
  /** Command name. Invoked as: `ands <name>`. Must be lowercase kebab-case. */
  name: string;
  /** One-line description shown in `ands --help` and `ands schema` output. */
  description: string;
  /**
   * Execute the command.
   * @param args - Parsed arguments after `ands <name>`
   * @param config - The fully resolved AndsConfig
   * @returns CliOutput conforming to the output contract
   */
  handler: (args: ParsedArgs, config: unknown) => Promise<CliOutput>;
}
