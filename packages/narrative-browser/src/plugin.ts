import type { AndsPlugin, CliOutput, TopLevelCommand, ParsedArgs } from '@ands/contracts';

function makeInfoOutput(command: string, message: string): CliOutput {
  return {
    outputVersion: '1.0.0',
    command,
    ok: true,
    exitCode: 0,
    summary: message,
    issues: [
      {
        category: 'narrative',
        code: 'playwright-not-installed',
        message: 'Playwright not installed',
        severity: 'info',
      },
    ],
  };
}

const visionAuditCommand: TopLevelCommand = {
  name: 'vision-audit',
  description: 'Capture and audit a page screenshot against design-system tokens',
  handler: async (_args: ParsedArgs): Promise<CliOutput> => {
    return makeInfoOutput(
      'vision-audit',
      'Vision audit requires Playwright. Install it with: pnpm add -D playwright',
    );
  },
};

const flowAuditCommand: TopLevelCommand = {
  name: 'flow-audit',
  description: 'Replay a user flow and audit each step against design-system patterns',
  handler: async (_args: ParsedArgs): Promise<CliOutput> => {
    return makeInfoOutput(
      'flow-audit',
      'Flow audit requires Playwright. Install it with: pnpm add -D playwright',
    );
  },
};

export const narrativeBrowserPlugin: AndsPlugin = {
  name: '@ands/narrative-browser',
  topLevelCommands: [visionAuditCommand, flowAuditCommand],
};
