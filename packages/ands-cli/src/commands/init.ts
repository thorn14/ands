/**
 * @module commands/init
 * @description `ands init` — generate a minimal `ands.config.ts` in the current directory.
 *
 * Detects project structure and generates a config file with sensible defaults.
 * Does NOT overwrite an existing config file unless `--force` is passed.
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ExitCode } from '../exit-codes.js';
import { makeOutput, emitOutput } from '../output.js';

const CONFIG_TEMPLATE = `import type { AndsConfig } from '@ands/contracts';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  adapters: [],
  plugins: [],
} satisfies AndsConfig;
`;

export async function runInit(args: string[]): Promise<number> {
  const cwd = process.cwd();
  const force = args.includes('--force');
  const configPath = join(cwd, 'ands.config.ts');

  if (existsSync(configPath) && !force) {
    return emitOutput(
      makeOutput(
        'scaffold',
        false,
        ExitCode.ContractRuleFailure,
        'ands.config.ts already exists',
        [
          {
            category: 'scaffold',
            code: 'CONFIG_EXISTS',
            message: 'ands.config.ts already exists in this directory',
            hint: 'Use --force to overwrite.',
            suggestion: 'ands init --force',
          },
        ],
      ),
    );
  }

  try {
    writeFileSync(configPath, CONFIG_TEMPLATE);
    return emitOutput(
      makeOutput(
        'scaffold',
        true,
        ExitCode.Success,
        'Generated ands.config.ts',
        [],
        {
          data: {
            file: 'ands.config.ts',
            nextStep: 'Edit ands.config.ts to add your DS adapter and plugins.',
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
        `Failed to write ands.config.ts: ${String(e instanceof Error ? e.message : e)}`,
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
