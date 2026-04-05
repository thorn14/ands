/**
 * @module plugin
 * @description AndsPlugin registration for @ands/a11y-bugbot.
 *
 * Registers `review` and `suggest-fixes` top-level commands.
 */

import type { AndsPlugin, TopLevelCommand, CliOutput, AndsConfig } from '@ands/contracts';
import { runReview } from './reviewer.js';

const reviewCommand: TopLevelCommand = {
  name: 'review',
  description: 'Run a11y/lint review and generate LLM-powered fix suggestions',
  handler: async (args, rawConfig) => {
    const config = rawConfig as AndsConfig;
    const postComments = !!args.flags['post-comments'];

    // In a real implementation, we'd collect issues from a11y-gate + lint-rules.
    // For now, accept issues via args or return info message.
    const issues = (args as any).issues ?? [];

    if (!config.narrative?.provider) {
      return {
        outputVersion: '1.0.0',
        command: 'review',
        ok: true,
        exitCode: 0,
        summary: 'LLM not configured — set narrative.provider in ands.config.ts',
        issues: [{
          category: 'narrative',
          code: 'LLM_NOT_CONFIGURED',
          message: 'No narrative provider configured. Set narrative.provider in ands.config.ts to enable LLM-powered suggestions.',
          severity: 'info',
        }],
      } satisfies CliOutput;
    }

    const result = await runReview(issues, config, { postComments });

    return {
      outputVersion: '1.0.0',
      command: 'review',
      ok: true,
      exitCode: 0,
      summary: `Review complete: ${result.suggestions.length} suggestion(s)${result.posted ? ' (posted to PR)' : ''}`,
      issues: result.issues,
      data: {
        suggestions: result.suggestions,
        posted: result.posted,
      },
    } satisfies CliOutput;
  },
};

const suggestFixesCommand: TopLevelCommand = {
  name: 'suggest-fixes',
  description: 'Generate fix suggestions for specific a11y issues',
  handler: async (args, rawConfig) => {
    const config = rawConfig as AndsConfig;

    if (!config.narrative?.provider) {
      return {
        outputVersion: '1.0.0',
        command: 'suggest-fixes',
        ok: true,
        exitCode: 0,
        summary: 'LLM not configured — set narrative.provider in ands.config.ts',
        issues: [{
          category: 'narrative',
          code: 'LLM_NOT_CONFIGURED',
          message: 'No narrative provider configured.',
          severity: 'info',
        }],
      } satisfies CliOutput;
    }

    const issues = (args as any).issues ?? [];
    const result = await runReview(issues, config);

    return {
      outputVersion: '1.0.0',
      command: 'suggest-fixes',
      ok: true,
      exitCode: 0,
      summary: `Generated ${result.suggestions.length} fix suggestion(s)`,
      issues: result.issues,
      data: { suggestions: result.suggestions },
    } satisfies CliOutput;
  },
};

export const a11yBugbotPlugin: AndsPlugin = {
  name: '@ands/a11y-bugbot',
  topLevelCommands: [reviewCommand, suggestFixesCommand],
};
