/**
 * @module cli
 * @description Main ANDS CLI dispatcher.
 *
 * Parses `process.argv` and routes to the appropriate command.
 * All output goes to stdout as JSON. Errors go to stderr (as JSON issues).
 *
 * **Stable exit codes** — see exit-codes.ts.
 * **Output schema** — see output-schema.json.
 */

import { runValidate } from './commands/validate.js';
import { runAuditTokens, parseAuditArgs } from './commands/audit-tokens.js';
import { runScaffold, parseScaffoldArgs } from './commands/scaffold.js';
import { VALIDATE_HELP } from './commands/validate.js';
import { AUDIT_TOKENS_HELP } from './commands/audit-tokens.js';
import { SCAFFOLD_HELP } from './commands/scaffold.js';
import { ExitCode } from './exit-codes.js';
import { makeOutput, emitOutput } from './output.js';

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

export async function runCli(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  try {
    const exitCode = await dispatch(command, rest);
    process.exit(exitCode);
  } catch (e) {
    const exitCode = emitOutput(
      makeOutput(
        'validate', // fallback command name
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

async function dispatch(command: string | undefined, args: string[]): Promise<number> {
  switch (command) {
    case 'validate': {
      const filePath = args[0];
      if (!filePath || filePath === '--help' || filePath === '-h') {
        process.stderr.write(VALIDATE_HELP + '\n');
        return ExitCode.ContractRuleFailure;
      }
      return runValidate(filePath);
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
      return runScaffold({
        pattern: scaffoldArgs.pattern,
        outputDir: scaffoldArgs.outputDir,
        featureName: scaffoldArgs.featureName ?? 'my-feature',
        adapterPackage: scaffoldArgs.adapterPackage ?? '@ands/ds-adapter-example',
        force: scaffoldArgs.force,
      });
    }

    case '--help':
    case '-h':
    case 'help':
    case undefined: {
      process.stderr.write(GLOBAL_HELP + '\n');
      return ExitCode.Success;
    }

    default: {
      process.stderr.write(`ands: unknown command "${command}"\n\n${GLOBAL_HELP}\n`);
      return ExitCode.ContractRuleFailure;
    }
  }
}

// ---------------------------------------------------------------------------
// Global help
// ---------------------------------------------------------------------------

const GLOBAL_HELP = `
ANDS CLI — Agent-Native Design System Governor

Usage:
  ands <command> [options]

Commands:
  validate <file>         Validate an intent file against its Interaction Kit schema
  audit-tokens [options]  Find hardcoded CSS values that should use token variables
  scaffold [options]      Generate boilerplate for a new feature

Options:
  --help, -h              Show help for a command

Output:
  All commands emit JSON to stdout. Parse with: ands <cmd> | jq .
  Exit codes: 0=success, 1=load-failure, 2=export-invalid, 3=schema-failure,
              4=contract-failure, 5=internal-error

See packages/ands-cli/src/output-schema.json for the full output contract.
`.trim();
