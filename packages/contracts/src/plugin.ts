/**
 * @module plugin
 * @description Extension contract for ANDS plugins.
 *
 * A plugin is a plain object that registers new patterns, scaffold templates,
 * and/or CLI commands with the ANDS runtime — without modifying any core package.
 *
 * **Usage (in ands.config.ts):**
 * ```ts
 * import { myPlugin } from '@mycompany/ands-plugin-data-table';
 * export default { plugins: [myPlugin] };
 * ```
 *
 * **Agent governor loop with plugins:**
 * ```bash
 * ands validate ./src/intent.js    # exit 0 = valid (supports plugin patterns)
 * ands run test                     # exit 0 = all plugin tests pass
 * ands run compliance tokens.json   # exit 0 = WCAG clean
 * ```
 *
 * **Boundary rule:** This file has no runtime imports — types only.
 * It may be imported by any tier (Foundation → Feature Lab → Adapters).
 */

import type { ZodTypeAny } from 'zod';

// ---------------------------------------------------------------------------
// Scaffold types
// ---------------------------------------------------------------------------

/** A single file to be written by the scaffold command. */
export interface ScaffoldFile {
  filename: string;
  content: string;
}

/** Options passed to a pattern's scaffold template generator. */
export interface ScaffoldOptions {
  /** Feature name used in generated identifiers (e.g. 'user-profile'). */
  name: string;
  /** Adapter package to import from (e.g. '@mycompany/my-ds-adapter'). */
  adapterPackage: string;
  /** Absolute path to the output directory. */
  outputDir: string;
}

// ---------------------------------------------------------------------------
// Pattern registration
// ---------------------------------------------------------------------------

/**
 * Register a new interaction pattern with the ANDS runtime.
 *
 * Once registered, agents can:
 *   - Validate intents with `ands validate` using the pattern's `kind`
 *   - Generate boilerplate with `ands scaffold --pattern <kind>`
 */
export interface PatternRegistration {
  /**
   * The `intent.kind` discriminant value (e.g. `'data-table'`).
   * Must be unique across all registered patterns.
   */
  kind: string;
  /** One-line description shown in `ands schema` output. */
  description: string;
  /** Zod schema used by `ands validate` to parse the intent. */
  schema: ZodTypeAny;
  /**
   * Returns the files to write for `ands scaffold --pattern <kind>`.
   * Called with dry-run options too — must be pure (no disk writes).
   */
  scaffoldFiles: (options: ScaffoldOptions) => ScaffoldFile[];
  /**
   * Ordered file paths for agent progressive disclosure.
   * Agents read these in order when learning the pattern.
   */
  entrypoints?: string[];
  /** Pattern tier/stability. @default 'experimental' */
  stability?: 'stable' | 'beta' | 'experimental';
}

// ---------------------------------------------------------------------------
// Plugin commands
// ---------------------------------------------------------------------------

/**
 * A CLI command contributed by a plugin, invoked as `ands run <name>`.
 *
 * **Contract:**
 * - MUST emit ANDS JSON to stdout (matches output-schema.json)
 * - MUST return a stable exit code (0 = ok, non-zero = failure)
 * - MAY shell out to any runner (vitest, jest, playwright, etc.) internally
 * - MUST use exitCode 6 for transient errors (network, file lock) — agents will retry
 * - MUST use exitCode 4 for permanent failures — agents will not retry
 *
 * This is how an agent runs `ands run test` instead of `pnpm test` — the
 * plugin wraps the underlying runner and maps results to Issue[] format.
 */
export interface PluginCommand {
  /** Command name. Invoked as: `ands run <name>`. Must be lowercase kebab-case. */
  name: string;
  /** One-line description shown in `ands schema run` output. */
  description: string;
  /**
   * Execute the command.
   * @param args - Remaining CLI arguments after `ands run <name>`
   * @returns Exit code (0 = success)
   */
  run: (args: string[]) => Promise<number>;
}

// ---------------------------------------------------------------------------
// Plugin object
// ---------------------------------------------------------------------------

/**
 * An ANDS plugin. Declare in `ands.config.ts` to extend the CLI.
 *
 * @example
 * ```ts
 * // packages/ds-adapter-gamut/src/plugin.ts
 * export const gamutPlugin: AndsPlugin = {
 *   name: '@mycompany/ands-plugin-gamut',
 *   patterns: [],                          // gamut adapts existing patterns
 *   commands: [complianceCommand, testCommand],
 * };
 * ```
 */
export interface AndsPlugin {
  /** Package name (for error messages and deduplication). */
  name: string;
  /** New interaction patterns contributed by this plugin. */
  patterns?: PatternRegistration[];
  /** New CLI commands contributed by this plugin (`ands run <name>`). */
  commands?: PluginCommand[];
}

// ---------------------------------------------------------------------------
// Config file shape (ands.config.ts)
// ---------------------------------------------------------------------------

/**
 * Shape of the project-level `ands.config.ts` default export.
 *
 * The CLI looks for this file in `process.cwd()` at startup.
 * If absent, ANDS runs with core patterns only (no plugins).
 *
 * @example
 * ```ts
 * // ands.config.ts
 * import { gamutPlugin } from '@mycompany/ands-plugin-gamut';
 * export default {
 *   adapter: '@mycompany/my-ds',
 *   plugins: [gamutPlugin],
 * } satisfies AndsConfig;
 * ```
 */
export interface AndsConfig {
  /** Default adapter package name (used in scaffold --adapter default). */
  adapter?: string;
  /** Plugins to load at CLI startup. */
  plugins?: AndsPlugin[];
}
