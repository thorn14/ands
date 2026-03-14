/**
 * @module cli
 * @description Main ANDS CLI dispatcher.
 *
 * Parses `process.argv` and routes to the appropriate command.
 * All output goes to stdout as JSON (piped) or human-readable (TTY).
 *
 * **Startup sequence:**
 * 1. Load `ands.config.ts` from cwd (optional — defaults to empty config)
 * 2. Build RuntimeRegistry from core patterns + plugin patterns/commands
 * 3. Dispatch to the appropriate command handler with the registry
 *
 * **Stable exit codes** — see exit-codes.ts.
 * **Output schema** — see output-schema.json.
 * **Agent tip** — run `ands schema` to introspect all commands at runtime.
 */

import { loadConfig } from './config.js';
import { buildRegistry } from './registry.js';
import { runValidate, VALIDATE_HELP } from './commands/validate.js';
import { runAuditTokens, parseAuditArgs, AUDIT_TOKENS_HELP } from './commands/audit-tokens.js';
import { runScaffold, parseScaffoldArgs, SCAFFOLD_HELP } from './commands/scaffold.js';
import { runSchema, SCHEMA_HELP } from './commands/schema.js';
import { ExitCode } from './exit-codes.js';
import { makeOutput, emitOutput } from './output.js';

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

export async function runCli(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  // Load config + build registry at startup
  let config;
  try {
    config = await loadConfig();
  } catch (e) {
    emitOutput(
      makeOutput(
        'validate',
        false,
        ExitCode.InternalError,
        `Failed to load ands.config.ts: ${String(e instanceof Error ? e.message : e)}`,
        [
          {
            category: 'plugin',
            code: 'CONFIG_LOAD_FAILURE',
            message: String(e instanceof Error ? e.message : e),
            hint: 'Check your ands.config.ts for syntax errors.',
          },
        ],
      ),
    );
    process.exit(ExitCode.InternalError);
    return; // unreachable but satisfies TypeScript narrowing
  }

  const registry = buildRegistry(config.plugins ?? [], config.adapter);

  try {
    const exitCode = await dispatch(command, rest, registry);
    process.exit(exitCode);
  } catch (e) {
    const exitCode = emitOutput(
      makeOutput(
        'validate',
        false,
        ExitCode.InternalError,
        `Internal CLI error: ${String(e instanceof Error ? e.message : e)}`,
        [
          {
            category: 'internal',
            code: 'UNHANDLED_ERROR',
            message: String(e instanceof Error ? e.stack ?? e.message : e),
          },
        ],
      ),
    );
    process.exit(exitCode);
  }
}

// ---------------------------------------------------------------------------
// Command dispatcher
// ---------------------------------------------------------------------------

async function dispatch(
  command: string | undefined,
  args: string[],
  registry: ReturnType<typeof buildRegistry>,
): Promise<number> {
  switch (command) {
    case 'validate': {
      const filePath = args[0];
      if (!filePath || filePath === '--help' || filePath === '-h') {
        process.stderr.write(VALIDATE_HELP + '\n');
        return ExitCode.ContractRuleFailure;
      }
      return runValidate(filePath, registry);
    }

    case 'audit-tokens': {
      if (args.includes('--help') || args.includes('-h')) {
        process.stderr.write(AUDIT_TOKENS_HELP + '\n');
        return ExitCode.Success;
      }
      const { config } = parseAuditArgs(args);
      return runAuditTokens(config);
    }

    case 'scaffold': {
      if (args.includes('--help') || args.includes('-h')) {
        process.stderr.write(SCAFFOLD_HELP + '\n');
        return ExitCode.Success;
      }
      const scaffoldArgs = parseScaffoldArgs(args);
      if (!scaffoldArgs.pattern || !scaffoldArgs.outputDir) {
        process.stderr.write(
          'ands scaffold: --pattern and --output are required.\n\n' + SCAFFOLD_HELP + '\n',
        );
        return ExitCode.ContractRuleFailure;
      }
      return runScaffold(
        {
          pattern: scaffoldArgs.pattern,
          outputDir: scaffoldArgs.outputDir,
          featureName: scaffoldArgs.featureName ?? 'my-feature',
          ...(scaffoldArgs.adapterPackage !== undefined ? { adapterPackage: scaffoldArgs.adapterPackage } : {}),
          ...(scaffoldArgs.force !== undefined ? { force: scaffoldArgs.force } : {}),
          ...(scaffoldArgs.dryRun !== undefined ? { dryRun: scaffoldArgs.dryRun } : {}),
        },
        registry,
      );
    }

    case 'schema': {
      if (args.includes('--help') || args.includes('-h')) {
        process.stderr.write(SCHEMA_HELP + '\n');
        return ExitCode.Success;
      }
      return runSchema(args[0], registry);
    }

    case 'run': {
      const cmdName = args[0];
      if (!cmdName || cmdName === '--help' || cmdName === '-h') {
        const names = Object.keys(registry.commands);
        process.stderr.write(
          names.length > 0
            ? `Available plugin commands: ${names.join(', ')}\nUsage: ands run <command> [...args]\n`
            : 'No plugin commands registered. Add plugins to ands.config.ts.\n',
        );
        return ExitCode.Success;
      }

      const cmd = registry.commands[cmdName];
      if (!cmd) {
        return emitOutput(
          makeOutput(
            'run',
            false,
            ExitCode.ContractRuleFailure,
            `Unknown plugin command: "${cmdName}"`,
            [
              {
                category: 'plugin',
                code: 'UNKNOWN_PLUGIN_COMMAND',
                message: `No plugin command named "${cmdName}" is registered`,
                hint: Object.keys(registry.commands).length > 0
                  ? `Available commands: ${Object.keys(registry.commands).join(', ')}`
                  : 'No plugin commands registered. Add plugins to ands.config.ts.',
                suggestion: 'ands schema run',
              },
            ],
          ),
        );
      }

      return cmd.run(args.slice(1));
    }

    case '--help':
    case '-h':
    case 'help':
    case undefined: {
      process.stderr.write(buildGlobalHelp(registry) + '\n');
      return ExitCode.Success;
    }

    default: {
      process.stderr.write(`ands: unknown command "${command}"\n\n${buildGlobalHelp(registry)}\n`);
      return ExitCode.ContractRuleFailure;
    }
  }
}

// ---------------------------------------------------------------------------
// Global help (dynamic — includes plugin commands)
// ---------------------------------------------------------------------------

function buildGlobalHelp(registry: ReturnType<typeof buildRegistry>): string {
  const pluginCmds = Object.values(registry.commands);
  const pluginSection = pluginCmds.length > 0
    ? '\nPlugin commands (via ands.config.ts):\n' +
      pluginCmds.map(c => `  ands run ${c.name.padEnd(18)} ${c.description}`).join('\n')
    : '';

  return `
ANDS CLI — Agent-Native Design System Governor

Usage:
  ands <command> [options]

Commands:
  validate <file>         Validate an intent file against its Interaction Kit schema
  audit-tokens [options]  Find hardcoded CSS values that should use token variables
  scaffold [options]      Generate boilerplate for a new feature
  schema [command]        Introspect command contracts at runtime (agents: use this)
  run <name> [...args]    Run a plugin command registered in ands.config.ts
${pluginSection}

Options:
  --help, -h              Show help for a command

Output:
  Piped:  JSON to stdout (parse with: ands <cmd> | jq .)
  TTY:    Human-readable summary (set ANDS_JSON=1 to force JSON)

Exit codes: 0=success, 1=load-failure, 2=export-invalid, 3=schema-failure,
            4=contract-failure, 5=internal-error, 6=transient (retry)

See packages/ands-cli/src/output-schema.json for the full output contract.
Run \`ands schema\` to discover all commands and registered patterns.
`.trim();
}
