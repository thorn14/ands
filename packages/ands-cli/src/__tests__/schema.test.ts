import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { runSchema } from '../commands/schema.js';
import type { RuntimeRegistry } from '../registry.js';

function createRegistry(): RuntimeRegistry {
  return {
    schemas: {},
    scaffoldTemplates: {},
    commands: {
      greet: {
        name: 'greet',
        description: 'Run the greeting command',
        run: async () => 0,
      },
    },
    topLevelCommands: {
      lint: {
        name: 'lint',
        description: 'Run lint checks',
        handler: async () => ({
          outputVersion: '1.0.0',
          command: 'lint',
          ok: true,
          exitCode: 0,
          summary: 'ok',
          issues: [],
        }),
      },
    },
    supportedKinds: ['editable-form'],
    defaultAdapter: '@ands/ds-adapter-example',
  };
}

describe('runSchema', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it('lists top-level plugin commands separately from run commands', async () => {
    await runSchema(undefined, createRegistry());

    const output = JSON.parse(String(stdoutSpy.mock.calls[0]?.[0]));
    const commands = output.data.commands as Array<{ name: string }>;
    const runCommands = output.data.pluginRunCommands as Array<{ name: string; invocation: string }>;

    expect(commands.some((command) => command.name === 'lint')).toBe(true);
    expect(commands.some((command) => command.name === 'greet')).toBe(false);
    expect(runCommands).toEqual([
      expect.objectContaining({
        name: 'greet',
        invocation: 'ands run greet [...args]',
      }),
    ]);
  });

  it('describes the built-in run command with plugin command metadata', async () => {
    await runSchema('run', createRegistry());

    const output = JSON.parse(String(stdoutSpy.mock.calls[0]?.[0]));
    expect(output.data.command).toBe('run');
    expect(output.data.args).toEqual({
      '<name>': expect.any(Object),
      '[...args]': expect.any(Object),
    });
    expect(output.data.pluginCommands).toEqual([
      expect.objectContaining({
        name: 'greet',
        invocation: 'ands run greet [...args]',
      }),
    ]);
  });

  it('supports introspection for plugin top-level commands', async () => {
    await runSchema('lint', createRegistry());

    const output = JSON.parse(String(stdoutSpy.mock.calls[0]?.[0]));
    expect(output.data.command).toBe('lint');
    expect(output.data.source).toBe('plugin');
    expect(output.data.description).toBe('Run lint checks');
  });
});
