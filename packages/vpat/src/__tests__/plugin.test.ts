import { describe, expect, it } from 'vitest';
import { vpatPlugin } from '../plugin.js';

describe('vpat command', () => {
  it('fails when no issues input is provided', async () => {
    const command = vpatPlugin.topLevelCommands?.[0];
    expect(command?.name).toBe('vpat');

    const output = await command!.handler({ raw: [], flags: {} }, {});
    expect(output.ok).toBe(false);
    expect(output.exitCode).toBe(4);
    expect(output.issues[0]?.code).toBe('MISSING_ISSUES_INPUT');
  });

  it('accepts explicit issues input', async () => {
    const command = vpatPlugin.topLevelCommands?.[0];

    const output = await command!.handler(
      { raw: [], flags: { issues: '[]', format: 'json' } },
      {},
    );
    expect(output.ok).toBe(true);
    expect(output.exitCode).toBe(0);
    expect(output.data?.format).toBe('json');
  });
});
