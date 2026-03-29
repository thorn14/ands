/**
 * @module runners/rendered
 * @description Tier 2 a11y runner: axe-core against rendered Storybook stories.
 *
 * Requires: Playwright + @axe-core/playwright (peer dependencies).
 * Tests live-rendered components for a11y violations.
 */

import type { A11yRunner, A11yRunConfig, AndsIssue } from '@ands/contracts';

export const renderedRunner: A11yRunner = {
  name: 'axe-core-rendered',
  tier: 'rendered',
  description: 'A11y testing of rendered Storybook stories via axe-core + Playwright',
  async run(runConfig: A11yRunConfig): Promise<AndsIssue[]> {
    if (!runConfig.url) {
      return [{
        category: 'compliance',
        code: 'A11Y_MISSING_URL',
        message: 'Tier 2 a11y testing requires --url pointing to a Storybook instance',
        severity: 'error',
      }];
    }

    // Placeholder — actual implementation requires Playwright + axe-core as peer deps
    return [{
      category: 'compliance',
      code: 'A11Y_RENDERED_NOT_INSTALLED',
      message: 'axe-core + Playwright not installed. Install: pnpm add -D @axe-core/playwright playwright',
      severity: 'info',
    }];
  },
};
