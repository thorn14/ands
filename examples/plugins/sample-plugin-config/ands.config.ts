/**
 * Sample plugin configuration for ANDS.
 *
 * This file serves as the living extension system test — it must always
 * typecheck and pass `ands schema --config`. It grows with each phase
 * as new extension points land.
 */
import type { AndsConfig, AndsPlugin, TopLevelCommand, CliOutput } from '@ands/contracts';

// Example top-level command
const helloCommand: TopLevelCommand = {
  name: 'hello',
  description: 'A sample top-level command',
  handler: async (_args, _config): Promise<CliOutput> => {
    return {
      outputVersion: '1.0.0',
      command: 'hello',
      ok: true,
      exitCode: 0,
      summary: 'Hello from the sample plugin!',
      issues: [],
    };
  },
};

// Example plugin
const samplePlugin: AndsPlugin = {
  name: 'sample-plugin',
  topLevelCommands: [helloCommand],
  commands: [
    {
      name: 'greet',
      description: 'A sample run command',
      run: async (_args: string[]) => {
        console.log(JSON.stringify({
          outputVersion: '1.0.0',
          command: 'run',
          ok: true,
          exitCode: 0,
          summary: 'Greetings!',
          issues: [],
        }));
        return 0;
      },
    },
  ],
};

export default {
  content: ['./src/**/*.{ts,tsx}'],
  adapters: [],
  plugins: [samplePlugin],
  enforcement: {
    tokens: { mode: 'error' },
    a11y: { tier1: { enabled: true } },
  },
} satisfies AndsConfig;
