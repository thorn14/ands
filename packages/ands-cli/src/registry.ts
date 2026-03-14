/**
 * @module registry
 * @description Runtime registry of patterns and plugin commands.
 *
 * Built once at CLI startup from:
 * 1. Core patterns (PATTERN_MANIFEST from @ands/interaction-kit)
 * 2. Plugin patterns and commands (from ands.config.ts)
 *
 * All CLI commands receive the registry and use it instead of hardcoded imports.
 */

import type { ZodTypeAny } from 'zod';
import { PATTERN_MANIFEST } from '@ands/interaction-kit';
import { editableFormIntentSchema } from '@ands/interaction-kit';
import { editableFormScaffoldFiles } from '@ands/interaction-kit';
import type { AndsPlugin, PluginCommand, ScaffoldFile, ScaffoldOptions } from '@ands/contracts';

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
};

const CORE_SCAFFOLD_TEMPLATES: Record<string, (opts: ScaffoldOptions) => ScaffoldFile[]> = {
  'editable-form': editableFormScaffoldFiles,
};

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

    // Register plugin commands
    for (const cmd of plugin.commands ?? []) {
      if (cmd.name in commands) {
        process.stderr.write(
          `ands: plugin "${plugin.name}" overrides existing command "ands run ${cmd.name}"\n`,
        );
      }
      commands[cmd.name] = cmd;
    }
  }

  // Derive supportedKinds from PATTERN_MANIFEST (core) + plugin patterns
  const coreKinds = PATTERN_MANIFEST.map(p => p.cliKind);
  const pluginKinds = plugins.flatMap(p => (p.patterns ?? []).map(pat => pat.kind));
  const supportedKinds = [...new Set([...coreKinds, ...pluginKinds])];

  return { schemas, scaffoldTemplates, commands, supportedKinds, defaultAdapter };
}
