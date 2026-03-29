/**
 * @module runners/page
 * @description Tier 3 a11y runner: Lighthouse + pa11y against staging URLs.
 *
 * Requires: lighthouse + pa11y (peer dependencies).
 * Tests full pages for performance and a11y scores.
 */

import type { A11yRunner, A11yRunConfig, AndsIssue } from '@ands/contracts';

export const pageRunner: A11yRunner = {
  name: 'lighthouse-page',
  tier: 'page',
  description: 'A11y and performance audit of staging URLs via Lighthouse + pa11y',
  async run(runConfig: A11yRunConfig): Promise<AndsIssue[]> {
    if (!runConfig.url) {
      return [{
        category: 'compliance',
        code: 'A11Y_MISSING_URL',
        message: 'Tier 3 a11y testing requires --url pointing to a staging URL',
        severity: 'error',
      }];
    }

    // Placeholder — actual implementation requires lighthouse + pa11y as peer deps
    return [{
      category: 'compliance',
      code: 'A11Y_PAGE_NOT_INSTALLED',
      message: 'Lighthouse + pa11y not installed. Install: pnpm add -D lighthouse pa11y',
      severity: 'info',
    }];
  },
};
