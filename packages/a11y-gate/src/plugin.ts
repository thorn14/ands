/**
 * @module plugin
 * @description AndsPlugin registration for @ands/a11y-gate.
 */

import type { AndsPlugin, TopLevelCommand, CliOutput, AndsConfig, A11yRunner, AndsIssue } from '@ands/contracts';
import { staticRunner } from './runners/static.js';
import { renderedRunner } from './runners/rendered.js';
import { pageRunner } from './runners/page.js';

const builtInRunners: A11yRunner[] = [staticRunner, renderedRunner, pageRunner];

const a11yCommand: TopLevelCommand = {
  name: 'a11y',
  description: 'Run a11y tests (static, rendered, and/or page)',
  handler: async (args, rawConfig) => {
    const config = rawConfig as AndsConfig;
    const allRunners = [...builtInRunners];

    // Collect runners from plugins
    for (const plugin of config.plugins ?? []) {
      if ('a11yRunners' in plugin && Array.isArray((plugin as AndsPlugin).a11yRunners)) {
        allRunners.push(...(plugin as AndsPlugin).a11yRunners!);
      }
    }

    // Validate --tier flag
    const tierFlag = args.flags['tier'];
    const url = typeof args.flags['url'] === 'string' ? args.flags['url'] : undefined;

    if (tierFlag !== undefined && typeof tierFlag !== 'string') {
      return {
        outputVersion: '1.0.0',
        command: 'a11y',
        ok: false,
        exitCode: 4,
        summary: '--tier requires a value: static, rendered, or page',
        issues: [{
          category: 'schema',
          code: 'INVALID_TIER_FLAG',
          message: '--tier requires a value (static, rendered, or page)',
          severity: 'error',
          suggestion: 'ands a11y --tier static',
        }],
      } satisfies CliOutput;
    }

    const tier = tierFlag as string | undefined;
    const validTiers = new Set(['static', 'rendered', 'page']);
    if (tier && !validTiers.has(tier)) {
      return {
        outputVersion: '1.0.0',
        command: 'a11y',
        ok: false,
        exitCode: 4,
        summary: `Unknown tier "${tier}"`,
        issues: [{
          category: 'schema',
          code: 'UNKNOWN_TIER',
          message: `Unknown tier "${tier}". Valid tiers: static, rendered, page`,
          severity: 'error',
          suggestion: 'ands a11y --tier static',
        }],
      } satisfies CliOutput;
    }

    const runnersToExecute = tier
      ? allRunners.filter(r => r.tier === tier)
      : allRunners;

    const allIssues: AndsIssue[] = [];
    for (const runner of runnersToExecute) {
      const runCfg = { config, tier: runner.tier, ...(url !== undefined ? { url } : {}) };
      const issues = await runner.run(runCfg);
      allIssues.push(...issues);
    }

    const errors = allIssues.filter(i => i.severity === 'error');
    const ok = errors.length === 0;

    return {
      outputVersion: '1.0.0',
      command: 'a11y',
      ok,
      exitCode: ok ? 0 : 4,
      summary: ok
        ? `A11y passed (${runnersToExecute.length} runners)`
        : `A11y found ${errors.length} error(s)`,
      issues: allIssues,
      data: {
        runnersExecuted: runnersToExecute.map(r => r.name),
        errors: errors.length,
        total: allIssues.length,
      },
    } satisfies CliOutput;
  },
};

export const a11yPlugin: AndsPlugin = {
  name: '@ands/a11y-gate',
  topLevelCommands: [a11yCommand],
  a11yRunners: builtInRunners,
};
