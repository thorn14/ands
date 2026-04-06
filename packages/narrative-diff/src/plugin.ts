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
        code: 'llm-not-configured',
        message: 'LLM provider not configured',
        severity: 'info',
      },
    ],
  };
}

const diffSummaryCommand: TopLevelCommand = {
  name: 'diff-summary',
  description: 'Summarise design-system changes between two commits',
  handler: async (_args: ParsedArgs): Promise<CliOutput> => {
    return makeInfoOutput(
      'diff-summary',
      'Diff summary requires an LLM provider. Configure one in ands.config.ts.',
    );
  },
};

const detectDriftCommand: TopLevelCommand = {
  name: 'detect-drift',
  description: 'Scan for one-off components that drift from design-system patterns',
  handler: async (_args: ParsedArgs): Promise<CliOutput> => {
    return makeInfoOutput(
      'detect-drift',
      'Drift detection requires an LLM provider. Configure one in ands.config.ts.',
    );
  },
};

const draftMigrationCommand: TopLevelCommand = {
  name: 'draft-migration',
  description: 'Draft a migration plan for a component to a target pattern',
  handler: async (_args: ParsedArgs): Promise<CliOutput> => {
    return makeInfoOutput(
      'draft-migration',
      'Migration drafting requires an LLM provider. Configure one in ands.config.ts.',
    );
  },
};

export const narrativeDiffPlugin: AndsPlugin = {
  name: '@ands/narrative-diff',
  topLevelCommands: [diffSummaryCommand, detectDriftCommand, draftMigrationCommand],
};
