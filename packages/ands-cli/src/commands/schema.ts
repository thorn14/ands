/**
 * @module commands/schema
 * @description `ands schema <command>` — introspect CLI command contracts at runtime.
 *
 * Agents call this once to understand what a command accepts and emits,
 * without reading documentation or burning tokens on --help prose.
 *
 * **Algorithm:**
 * 1. Look up the requested command name in the schema index
 * 2. Emit a JSON description of its accepted args and output shape
 *
 * **Output:** JSON to stdout (same output-schema.json contract as other commands).
 */

import { ExitCode } from '../exit-codes.js';
import { makeOutput, emitOutput } from '../output.js';
import type { RuntimeRegistry } from '../registry.js';
// Output schema $id — used as a reference in schema introspection output
const OUTPUT_SCHEMA_ID = 'https://ands.dev/schemas/cli-output/v1.json';

// ---------------------------------------------------------------------------
// Per-command arg descriptors
// ---------------------------------------------------------------------------

const COMMAND_ARGS: Record<string, Record<string, { type: string; required: boolean; description: string }>> = {
  validate: {
    '<file>': { type: 'string', required: true, description: 'Path to intent JS/TS module. Must export: export const intent = { kind: "...", ... }' },
  },
  'audit-tokens': {
    '--token-index': { type: 'string', required: false, description: 'Path to tokens.index.json' },
    '--dir': { type: 'string', required: false, description: 'Comma-separated directories to scan (default: src)' },
    '--allow': { type: 'string', required: false, description: 'Comma-separated additional allowed literals' },
    '--stream': { type: 'boolean', required: false, description: 'Stream issues as NDJSON (one JSON line per violation)' },
  },
  scaffold: {
    '--pattern': { type: 'string', required: true, description: 'Pattern kind to scaffold (e.g. editable-form)' },
    '--output': { type: 'string', required: true, description: 'Output directory path' },
    '--name': { type: 'string', required: false, description: 'Feature name for generated identifiers (default: my-feature)' },
    '--adapter': { type: 'string', required: false, description: 'Adapter package to import from (default: from ands.config.ts or @ands/ds-adapter-example)' },
    '--force': { type: 'boolean', required: false, description: 'Overwrite existing files' },
    '--dry-run': { type: 'boolean', required: false, description: 'Emit files as JSON without writing to disk' },
  },
  schema: {
    '<command>': { type: 'string', required: true, description: 'Command name to introspect (validate, audit-tokens, scaffold, run)' },
  },
  run: {
    '<name>': { type: 'string', required: true, description: 'Plugin command name (registered via ands.config.ts)' },
    '[...args]': { type: 'string[]', required: false, description: 'Arguments forwarded to the plugin command' },
  },
};

// ---------------------------------------------------------------------------
// Command implementation
// ---------------------------------------------------------------------------

export async function runSchema(targetCommand: string | undefined, registry: RuntimeRegistry): Promise<number> {
  if (!targetCommand) {
    // List all available commands
    const builtIn = Object.keys(COMMAND_ARGS);
    const pluginCommands = Object.keys(registry.commands);
    const allCommands = [...new Set([...builtIn, ...pluginCommands])];

    return emitOutput(
      makeOutput(
        'schema',
        true,
        ExitCode.Success,
        `${allCommands.length} command(s) available`,
        [],
        {
          data: {
            commands: allCommands.map(name => ({
              name,
              source: pluginCommands.includes(name) && !builtIn.includes(name) ? 'plugin' : 'core',
              description: registry.commands[name]?.description ?? COMMAND_DESCRIPTIONS[name] ?? '',
              args: COMMAND_ARGS[name] ?? {},
            })),
            patterns: registry.supportedKinds,
            outputSchema: { $ref: OUTPUT_SCHEMA_ID },
          },
        },
      ),
    );
  }

  const isBuiltIn = targetCommand in COMMAND_ARGS;
  const isPlugin = targetCommand in registry.commands;

  if (!isBuiltIn && !isPlugin) {
    return emitOutput(
      makeOutput(
        'schema',
        false,
        ExitCode.ContractRuleFailure,
        `Unknown command: "${targetCommand}"`,
        [
          {
            category: 'schema',
            code: 'UNKNOWN_COMMAND',
            message: `No command named "${targetCommand}" is registered`,
            hint: 'Run `ands schema` (no args) to list all available commands.',
            suggestion: 'ands schema',
          },
        ],
      ),
    );
  }

  const args = COMMAND_ARGS[targetCommand] ?? {};
  const pluginMeta = isPlugin ? { name: registry.commands[targetCommand]!.name, description: registry.commands[targetCommand]!.description } : null;

  return emitOutput(
    makeOutput(
      'schema',
      true,
      ExitCode.Success,
      `Schema for command: ${targetCommand}`,
      [],
      {
        data: {
          command: targetCommand,
          source: isBuiltIn ? 'core' : 'plugin',
          description: pluginMeta?.description ?? COMMAND_DESCRIPTIONS[targetCommand] ?? '',
          args,
          emits: { $ref: OUTPUT_SCHEMA_ID },
          exitCodes: {
            0: 'Success',
            1: 'Module load failure (permanent — fix first)',
            2: 'Intent export invalid (permanent)',
            3: 'Schema parse failure (permanent)',
            4: 'Contract rule failure (permanent)',
            5: 'Internal CLI error (permanent)',
            6: 'Transient error (retry with exponential backoff)',
          },
          ...(targetCommand === 'scaffold' ? { patterns: registry.supportedKinds } : {}),
        },
      },
    ),
  );
}

const COMMAND_DESCRIPTIONS: Record<string, string> = {
  validate: 'Validate an intent file against its Interaction Kit schema',
  'audit-tokens': 'Scan source files for hardcoded CSS/TS values that should use token variables',
  scaffold: 'Generate boilerplate for a new feature using an Interaction Kit pattern',
  schema: 'Introspect CLI command contracts at runtime (agents: call this instead of --help)',
  run: 'Run a plugin command (registered via ands.config.ts)',
};

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

export const SCHEMA_HELP = `
ands schema [command]

  Introspect CLI command contracts at runtime.
  Agents: call this once instead of reading --help prose.

  Arguments:
    [command]   Optional command name to introspect.
                Omit to list all available commands.

  Output:    JSON to stdout — command args, output schema ref, exit codes

  Exit codes:
    0  Schema emitted
    4  Unknown command

  Examples:
    ands schema                   # list all commands + registered patterns
    ands schema validate          # args + output shape for validate
    ands schema scaffold          # args + available patterns
    ands schema run               # plugin commands from ands.config.ts
`.trim();
