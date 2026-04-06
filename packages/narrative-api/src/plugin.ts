import type { AndsPlugin, CliOutput, TopLevelCommand, ParsedArgs } from '@ands/contracts';
import { builtInTriageRules } from './triage/rules.js';

const apiSurfaceCommand: TopLevelCommand = {
  name: 'api-surface',
  description: 'Analyse an API response and triage fields by design-system relevance',
  handler: async (_args: ParsedArgs): Promise<CliOutput> => {
    return {
      outputVersion: '1.0.0',
      command: 'api-surface',
      ok: true,
      exitCode: 0,
      summary: 'API surface analysis requires a --url flag pointing to a live endpoint.',
      issues: [
        {
          category: 'narrative',
          code: 'api-surface-placeholder',
          message: 'LLM provider not configured',
          severity: 'info',
        },
      ],
    };
  },
};

export const narrativeApiPlugin: AndsPlugin = {
  name: '@ands/narrative-api',
  topLevelCommands: [apiSurfaceCommand],
  triageRules: builtInTriageRules,
};
