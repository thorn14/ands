/**
 * @module runners/rendered
 * @description Tier 2 a11y runner: axe-core against rendered Storybook stories via Playwright.
 *
 * Requires: Playwright + @axe-core/playwright (optional peer dependencies).
 * Gracefully falls back when peer deps are not installed.
 */

import type { A11yRunner, A11yRunConfig, AndsIssue } from '@ands/contracts';
import { tryImport, peerNotInstalledIssue } from '../resolve-peer.js';

interface AxeViolation {
  id: string;
  impact?: string;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

interface AxeResults {
  violations: AxeViolation[];
  passes: unknown[];
  incomplete: unknown[];
  inapplicable: unknown[];
}

function mapImpactToSeverity(impact?: string): 'error' | 'warn' | 'info' {
  switch (impact) {
    case 'critical':
    case 'serious':
      return 'error';
    case 'moderate':
      return 'warn';
    default:
      return 'info';
  }
}

function extractWcagTags(tags: string[]): string[] {
  return tags.filter(t => t.startsWith('wcag') || t.startsWith('best-practice'));
}

function mapAxeViolations(violations: AxeViolation[], url: string): AndsIssue[] {
  const issues: AndsIssue[] = [];
  for (const violation of violations) {
    const wcagTags = extractWcagTags(violation.tags);
    for (const node of violation.nodes) {
      issues.push({
        category: 'compliance',
        code: violation.id,
        message: `${violation.help} (${violation.impact ?? 'unknown'})`,
        severity: mapImpactToSeverity(violation.impact),
        loc: { file: url },
        hint: node.failureSummary ?? violation.description,
        path: wcagTags,
      });
    }
  }
  return issues;
}

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

    // Dynamic imports for optional peer deps
    const playwrightMod = await tryImport<typeof import('playwright')>('playwright');
    if (!playwrightMod) {
      return [peerNotInstalledIssue(
        'A11Y_RENDERED_NOT_INSTALLED',
        'playwright',
        'pnpm add -D playwright @axe-core/playwright',
      )];
    }

    const axePlaywrightMod = await tryImport<any>('@axe-core/playwright');
    if (!axePlaywrightMod) {
      return [peerNotInstalledIssue(
        'A11Y_RENDERED_NOT_INSTALLED',
        '@axe-core/playwright',
        'pnpm add -D @axe-core/playwright',
      )];
    }

    const AxeBuilder = axePlaywrightMod.default ?? axePlaywrightMod.AxeBuilder ?? axePlaywrightMod;

    let browser;
    try {
      browser = await playwrightMod.chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(runConfig.url, { waitUntil: 'networkidle' });

      const results: AxeResults = await new AxeBuilder({ page }).analyze();
      return mapAxeViolations(results.violations, runConfig.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [{
        category: 'compliance',
        code: 'A11Y_RENDERED_ERROR',
        message: `axe-core analysis failed: ${message}`,
        severity: 'error',
      }];
    } finally {
      if (browser) await browser.close();
    }
  },
};
