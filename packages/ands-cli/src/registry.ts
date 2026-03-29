/**
 * @module registry
 * @description Runtime registry of patterns, plugin commands, and top-level commands.
 *
 * Built once at CLI startup from:
 * 1. Core patterns (PATTERN_MANIFEST from @ands/interaction-kit)
 * 2. Plugin patterns and commands (from ands.config.ts)
 */

import type { ZodTypeAny } from 'zod';
import { PATTERN_MANIFEST } from '@ands/interaction-kit';
import { editableFormIntentSchema } from '@ands/interaction-kit';
import { editableFormScaffoldFiles } from '@ands/interaction-kit';
import type { AndsPlugin, PluginCommand, ScaffoldFile, ScaffoldOptions, TopLevelCommand } from '@ands/contracts';
import { dsAdapterScaffoldFiles } from './scaffold-templates/ds-adapter.js';

// ---------------------------------------------------------------------------
// Registry shape
// ---------------------------------------------------------------------------

export interface RuntimeRegistry {
  /** kind → Zod schema (for `ands validate`) */
  schemas: Record<string, ZodTypeAny>;
  /** kind → scaffold template function (for `ands scaffold`) */
  scaffoldTemplates: Record<string, (opts: ScaffoldOptions) => ScaffoldFile[]>;
  /** command name → plugin command (for `ands run <name>`) */
  commands: Record<string, PluginCommand>;
  /** top-level command name → handler (for `ands <name>` via plugins) */
  topLevelCommands: Record<string, TopLevelCommand>;
  /** All registered pattern kinds (for validation and discovery) */
  supportedKinds: string[];
  /** Default adapter package (from ands.config.ts or hardcoded fallback) */
  defaultAdapter: string;
}

// ---------------------------------------------------------------------------
// Core seed — always present regardless of plugins
// ---------------------------------------------------------------------------

const CORE_SCHEMAS: Record<string, ZodTypeAny> = {
  'editable-form': editableFormIntentSchema,
  // ds-adapter has no validation schema — scaffold only
};

const CORE_SCAFFOLD_TEMPLATES: Record<string, (opts: ScaffoldOptions) => ScaffoldFile[]> = {
  'editable-form': editableFormScaffoldFiles,
  'ds-adapter': dsAdapterScaffoldFiles,
};

/** Reserved built-in command names that plugins cannot override. */
const RESERVED_COMMANDS = new Set([
  'validate', 'audit-tokens', 'scaffold', 'schema', 'run', 'init',
  'help', '--help', '-h',
]);

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Build the runtime registry from core patterns + loaded plugins.
 *
 * @param plugins - Plugin objects from `ands.config.ts`
 * @param defaultAdapter - Default adapter package (from config or fallback)
 */
export function buildRegistry(
  plugins: AndsPlugin[] = [],
  defaultAdapter = '@ands/ds-adapter-example',
): RuntimeRegistry {
  const schemas: Record<string, ZodTypeAny> = { ...CORE_SCHEMAS };
  const scaffoldTemplates: Record<string, (opts: ScaffoldOptions) => ScaffoldFile[]> = {
    ...CORE_SCAFFOLD_TEMPLATES,
  };
  const commands: Record<string, PluginCommand> = {};
  const topLevelCommands: Record<string, TopLevelCommand> = {};

  for (const plugin of plugins) {
    // Register plugin patterns
    for (const pattern of plugin.patterns ?? []) {
      if (pattern.kind in schemas) {
        process.stderr.write(
          `ands: plugin "${plugin.name}" overrides existing pattern "${pattern.kind}"\n`,
        );
      }
      schemas[pattern.kind] = pattern.schema;
      scaffoldTemplates[pattern.kind] = pattern.scaffoldFiles;
    }

    // Register plugin commands (ands run <name>)
    for (const cmd of plugin.commands ?? []) {
      if (cmd.name in commands) {
        process.stderr.write(
          `ands: plugin "${plugin.name}" overrides existing command "ands run ${cmd.name}"\n`,
        );
      }
      commands[cmd.name] = cmd;
    }

    // Register top-level commands (ands <name>)
    for (const tlc of plugin.topLevelCommands ?? []) {
      if (RESERVED_COMMANDS.has(tlc.name)) {
        process.stderr.write(
          `ands: plugin "${plugin.name}" cannot register reserved command "${tlc.name}" — skipping\n`,
        );
        continue;
      }
      if (tlc.name in topLevelCommands) {
        process.stderr.write(
          `ands: plugin "${plugin.name}" overrides existing top-level command "${tlc.name}"\n`,
        );
      }
      topLevelCommands[tlc.name] = tlc;
    }
  }

  // Derive supportedKinds from PATTERN_MANIFEST (core) + scaffold templates + plugin patterns
  const coreKinds = PATTERN_MANIFEST.map(p => p.cliKind);
  const scaffoldKinds = Object.keys(CORE_SCAFFOLD_TEMPLATES);
  const pluginKinds = plugins.flatMap(p => (p.patterns ?? []).map(pat => pat.kind));
  const supportedKinds = [...new Set([...coreKinds, ...scaffoldKinds, ...pluginKinds])];

  return { schemas, scaffoldTemplates, commands, topLevelCommands, supportedKinds, defaultAdapter };
}
