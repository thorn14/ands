/**
 * @module commands/scaffold
 * @description `ands scaffold --pattern <type> --output <dir>` — generates feature boilerplate.
 *
 * Generates files from the registered scaffold template for the given pattern.
 * Core templates live in interaction-kit. Plugin templates come from ands.config.ts.
 *
 * **Dry-run:** Pass `--dry-run` to emit files as JSON without writing to disk.
 * Agents should use dry-run to verify output before committing.
 *
 * **Output:** JSON to stdout + files written to `--output` directory (unless --dry-run).
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { ExitCode } from '../exit-codes.js';
import { makeOutput, emitOutput } from '../output.js';
import type { RuntimeRegistry } from '../registry.js';

// ---------------------------------------------------------------------------
// Scaffold options
// ---------------------------------------------------------------------------

export interface ScaffoldOptions {
  /** Pattern kind to scaffold (e.g. 'editable-form'). */
  pattern: string;
  /** Output directory path. */
  outputDir: string;
  /** Feature name used in generated identifiers (e.g. 'user-profile'). */
  featureName: string;
  /** Adapter package to import from. Falls back to registry.defaultAdapter. */
  adapterPackage?: string;
  /** Overwrite existing files. @default false */
  force?: boolean;
  /** Emit files as JSON without writing to disk. @default false */
  dryRun?: boolean;
}

// ---------------------------------------------------------------------------
// Command implementation
// ---------------------------------------------------------------------------

export async function runScaffold(options: ScaffoldOptions, registry: RuntimeRegistry): Promise<number> {
  const { outputDir, pattern, featureName, force = false, dryRun = false } = options;
  const adapterPackage = options.adapterPackage ?? registry.defaultAdapter;

  // Validate pattern against registry
  if (!registry.supportedKinds.includes(pattern)) {
    return emitOutput(
      makeOutput(
        'scaffold',
        false,
        ExitCode.ContractRuleFailure,
        `Unknown pattern: "${pattern}"`,
        [
          {
            category: 'scaffold',
            code: 'UNKNOWN_PATTERN',
            message: `Pattern "${pattern}" is not registered`,
            hint: `Supported patterns: ${registry.supportedKinds.join(', ')}`,
            suggestion: `ands schema scaffold`,
          },
        ],
      ),
    );
  }

  // Check output directory (skip for dry-run)
  if (!dryRun && existsSync(outputDir) && !force) {
    return emitOutput(
      makeOutput(
        'scaffold',
        false,
        ExitCode.ContractRuleFailure,
        `Output directory already exists: ${outputDir}`,
        [
          {
            category: 'scaffold',
            code: 'OUTPUT_DIR_EXISTS',
            message: `Directory "${outputDir}" already exists`,
            hint: 'Use --force to overwrite existing files.',
            suggestion: `ands scaffold --pattern ${pattern} --output ${outputDir} --name ${featureName} --force`,
          },
        ],
      ),
    );
  }

  // Generate files via registry template
  const templateFn = registry.scaffoldTemplates[pattern];
  if (!templateFn) {
    return emitOutput(
      makeOutput(
        'scaffold',
        false,
        ExitCode.InternalError,
        `No scaffold template registered for pattern "${pattern}"`,
        [{ category: 'internal', code: 'TEMPLATE_MISSING', message: `Template for "${pattern}" was not found in registry` }],
      ),
    );
  }

  const filesToWrite = templateFn({ name: featureName, adapterPackage, outputDir });

  // Dry-run: return files as JSON, no disk writes
  if (dryRun) {
    return emitOutput(
      makeOutput(
        'scaffold',
        true,
        ExitCode.Success,
        `Dry-run: ${filesToWrite.length} file(s) would be written to ${outputDir}`,
        [],
        {
          data: {
            pattern,
            outputDir,
            dryRun: true,
            files: filesToWrite,
          },
        },
      ),
    );
  }

  // Write files to disk
  try {
    mkdirSync(outputDir, { recursive: true });
    const written: string[] = [];
    for (const { filename, content } of filesToWrite) {
      const filePath = join(outputDir, filename);
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, content);
      written.push(filename);
    }

    return emitOutput(
      makeOutput(
        'scaffold',
        true,
        ExitCode.Success,
        `Scaffolded ${pattern} feature in ${outputDir}`,
        [],
        {
          data: {
            pattern,
            outputDir,
            filesWritten: written,
            nextStep: `ands validate ${join(outputDir, 'intent.js')}`,
          },
        },
      ),
    );
  } catch (e) {
    return emitOutput(
      makeOutput(
        'scaffold',
        false,
        ExitCode.InternalError,
        `Failed to write files: ${String(e instanceof Error ? e.message : e)}`,
        [
          {
            category: 'internal',
            code: 'FILE_WRITE_FAILURE',
            message: String(e instanceof Error ? e.message : e),
          },
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// CLI argument parser
// ---------------------------------------------------------------------------

export interface ScaffoldArgs {
  pattern?: string;
  outputDir?: string;
  featureName?: string;
  adapterPackage?: string;
  force?: boolean;
  dryRun?: boolean;
}

export function parseScaffoldArgs(args: string[]): ScaffoldArgs {
  const result: ScaffoldArgs = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pattern' && args[i + 1]) {
      result.pattern = args[i + 1]!;
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      result.outputDir = args[i + 1]!;
      i++;
    } else if (args[i] === '--name' && args[i + 1]) {
      result.featureName = args[i + 1]!;
      i++;
    } else if (args[i] === '--adapter' && args[i + 1]) {
      result.adapterPackage = args[i + 1]!;
      i++;
    } else if (args[i] === '--force') {
      result.force = true;
    } else if (args[i] === '--dry-run') {
      result.dryRun = true;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

export const SCAFFOLD_HELP = `
ands scaffold --pattern <type> --output <dir> [options]

  Generate boilerplate for a new feature using an Interaction Kit pattern.

  Required:
    --pattern <type>    Pattern kind (run \`ands schema scaffold\` for available kinds)
    --output <dir>      Output directory path

  Options:
    --name <name>       Feature name for generated identifiers (default: my-feature)
    --adapter <pkg>     Adapter package to import from (default: from ands.config.ts)
    --force             Overwrite existing files
    --dry-run           Emit files as JSON without writing to disk

  Output:    JSON to stdout + files written to --output dir (unless --dry-run)

  Exit codes:
    0  Files generated (or dry-run output emitted)
    4  Unknown pattern or directory exists (use --force)
    5  File write failure

  Generated files (editable-form):
    intent.js     — intent object (run ands validate on this)
    reducer.ts    — state machine with exhaustive switch
    styles.css    — CSS stub using token variables
    index.ts      — barrel export

  Example:
    ands scaffold --pattern editable-form --output src/features/user-profile --name user-profile
    ands scaffold --pattern editable-form --output src/features/user-profile --name user-profile --dry-run
    ands validate src/features/user-profile/intent.js
`.trim();
