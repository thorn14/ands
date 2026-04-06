import { describe, expect, it } from 'vitest';
import { mcpServerPlugin } from '../plugin.js';

describe('mcpServerPlugin', () => {
  it('fails serve until server startup is implemented', async () => {
    const command = mcpServerPlugin.topLevelCommands?.[0];
    expect(command?.name).toBe('serve');

    const output = await command!.handler({ raw: [], flags: {} }, {});
    expect(output.ok).toBe(false);
    expect(output.exitCode).toBe(4);
    expect(output.issues[0]?.code).toBe('MCP_SERVER_NOT_IMPLEMENTED');
  });
});
