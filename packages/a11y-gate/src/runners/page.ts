/**
 * @module runners/page
 * @description Tier 3 a11y runner: Lighthouse accessibility audit of staging URLs.
 *
 * Requires: lighthouse (optional peer dependency).
 * Gracefully falls back when not installed.
 */

import type { A11yRunner, A11yRunConfig, AndsIssue, AndsConfig } from '@ands/contracts';
import { tryImport, peerNotInstalledIssue } from '../resolve-peer.js';

interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  details?: {
    items?: Array<{ node?: { snippet?: string; selector?: string } }>;
  };
}

interface LighthouseCategory {
  id: string;
  score: number | null;
  auditRefs: Array<{ id: string; weight: number }>;
}

interface LighthouseResult {
  lhr: {
    categories: Record<string, LighthouseCategory>;
    audits: Record<string, LighthouseAudit>;
  };
}

function extractWcagFromDescription(description: string): string[] {
  const tags: string[] = [];
  // Lighthouse descriptions often link to web.dev or WCAG refs
  const wcagMatch = description.match(/\d+\.\d+\.\d+/g);
  if (wcagMatch) {
    tags.push(...wcagMatch.map(m => `wcag${m.replace(/\./g, '')}`));
  }
  return tags;
}

export const pageRunner: A11yRunner = {
  name: 'lighthouse-page',
  tier: 'page',
  description: 'Lighthouse accessibility audit of staging URLs',
  async run(runConfig: A11yRunConfig): Promise<AndsIssue[]> {
    if (!runConfig.url) {
      return [{
        category: 'compliance',
        code: 'A11Y_MISSING_URL',
        message: 'Tier 3 a11y testing requires --url pointing to a staging URL',
        severity: 'error',
      }];
    }

    const lighthouseMod = await tryImport<any>('lighthouse');
    if (!lighthouseMod) {
      return [peerNotInstalledIssue(
        'A11Y_PAGE_NOT_INSTALLED',
        'lighthouse',
        'pnpm add -D lighthouse',
      )];
    }

    const lighthouse = lighthouseMod.default ?? lighthouseMod;

    try {
      const result: LighthouseResult = await lighthouse(runConfig.url, {
        onlyCategories: ['accessibility'],
        output: 'json',
        logLevel: 'error',
      });

      const issues: AndsIssue[] = [];
      const a11yCategory = result.lhr.categories['accessibility'];
      const audits = result.lhr.audits;

      // Check overall score
      const config = runConfig.config as AndsConfig;
      const minScore = config?.enforcement?.a11y?.tier3?.minScore ?? 90;
      const overallScore = (a11yCategory?.score ?? 0) * 100;

      if (overallScore < minScore) {
        issues.push({
          category: 'compliance',
          code: 'A11Y_SCORE_BELOW_THRESHOLD',
          message: `Lighthouse accessibility score ${overallScore} is below minimum ${minScore}`,
          severity: 'error',
          hint: `Improve accessibility to reach a score of ${minScore}+`,
        });
      }

      // Map failed audits to issues
      for (const ref of a11yCategory?.auditRefs ?? []) {
        const audit = audits[ref.id];
        if (!audit || audit.score === null || audit.score >= 1) continue;
        if (audit.scoreDisplayMode === 'notApplicable' || audit.scoreDisplayMode === 'manual') continue;

        const wcagTags = extractWcagFromDescription(audit.description);
        const items = audit.details?.items ?? [];

        if (items.length > 0) {
          for (const item of items) {
            issues.push({
              category: 'compliance',
              code: audit.id,
              message: audit.title,
              severity: audit.score === 0 ? 'error' : 'warn',
              loc: { file: runConfig.url },
              hint: item.node?.snippet ?? audit.description,
              path: wcagTags,
            });
          }
        } else {
          issues.push({
            category: 'compliance',
            code: audit.id,
            message: audit.title,
            severity: audit.score === 0 ? 'error' : 'warn',
            loc: { file: runConfig.url },
            hint: audit.description,
            path: wcagTags,
          });
        }
      }

      return issues;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return [{
        category: 'compliance',
        code: 'A11Y_PAGE_ERROR',
        message: `Lighthouse analysis failed: ${message}`,
        severity: 'error',
      }];
    }
  },
};
