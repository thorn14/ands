import { describe, it, expect } from 'vitest';
import { generateVpat, vpatToMarkdown, vpatToJson, vpatToHtml } from '../generate-vpat.js';
import { generateAcr } from '../generate-acr.js';
import { axeTagsToCriterionIds } from '../axe-wcag-map.js';
import { lighthouseAuditToCriterionIds } from '../lighthouse-wcag-map.js';
import { wcagCriteria } from '../wcag-criteria.js';
import { vpatPlugin } from '../plugin.js';
import type { AndsIssue } from '@ands/contracts';

describe('VPAT generator', () => {
  it('generates report with no issues (full conformance)', () => {
    const report = generateVpat([]);
    expect(report.criteria.length).toBeGreaterThan(0);
    expect(report.summary.doesNotSupport).toBe(0);
    expect(report.wcagLevel).toBe('AA');
  });

  it('marks criterion as Does Not Support when error issues exist', () => {
    const issues: AndsIssue[] = [{
      category: 'compliance',
      code: 'image-alt',
      message: 'img missing alt',
      severity: 'error',
      path: ['wcag111'],
    }];
    const report = generateVpat(issues);
    const criterion = report.criteria.find(c => c.criterion.id === '1.1.1');
    expect(criterion?.conformance).toBe('Does Not Support');
  });

  it('marks criterion as Partially Supports when only warnings exist', () => {
    const issues: AndsIssue[] = [{
      category: 'compliance',
      code: 'image-alt',
      message: 'img alt is empty',
      severity: 'warn',
      path: ['wcag111'],
    }];
    const report = generateVpat(issues);
    const criterion = report.criteria.find(c => c.criterion.id === '1.1.1');
    expect(criterion?.conformance).toBe('Partially Supports');
  });

  it('respects wcagLevel config', () => {
    const report = generateVpat([], { wcagLevel: 'A' });
    expect(report.wcagLevel).toBe('A');
    const hasAA = report.criteria.some(c => c.criterion.level === 'AA');
    expect(hasAA).toBe(false);
  });

  it('generates valid markdown', () => {
    const report = generateVpat([]);
    const md = vpatToMarkdown(report);
    expect(md).toContain('VPAT');
    expect(md).toContain('WCAG 2.2');
    expect(md).toContain('Perceivable');
  });

  it('generates valid JSON', () => {
    const report = generateVpat([]);
    const json = vpatToJson(report);
    const parsed = JSON.parse(json);
    expect(parsed.criteria).toBeDefined();
    expect(parsed.summary).toBeDefined();
  });

  it('generates valid HTML', () => {
    const report = generateVpat([]);
    const html = vpatToHtml(report);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('VPAT');
  });
});

describe('ACR generator', () => {
  it('generates ACR summary from VPAT report', () => {
    const report = generateVpat([]);
    const acr = generateAcr(report);
    expect(acr.productName).toBeDefined();
    expect(acr.totalCriteria).toBeGreaterThan(0);
    expect(acr.coveragePercentage).toBeGreaterThanOrEqual(0);
  });

  it('determines overall conformance correctly', () => {
    const issues: AndsIssue[] = [{
      category: 'compliance',
      code: 'color-contrast',
      message: 'low contrast',
      severity: 'error',
      path: ['wcag143'],
    }];
    const report = generateVpat(issues);
    const acr = generateAcr(report);
    expect(acr.overallConformance).toBe('Does Not Support');
  });
});

describe('axe-wcag-map', () => {
  it('parses wcag tags to criterion IDs', () => {
    expect(axeTagsToCriterionIds(['wcag111'])).toEqual(['1.1.1']);
    expect(axeTagsToCriterionIds(['wcag143'])).toEqual(['1.4.3']);
    expect(axeTagsToCriterionIds(['best-practice'])).toEqual([]);
  });
});

describe('lighthouse-wcag-map', () => {
  it('maps known audit IDs', () => {
    expect(lighthouseAuditToCriterionIds('image-alt')).toEqual(['1.1.1']);
    expect(lighthouseAuditToCriterionIds('color-contrast')).toEqual(['1.4.3']);
    expect(lighthouseAuditToCriterionIds('unknown-audit')).toEqual([]);
  });
});

describe('wcag-criteria', () => {
  it('has all WCAG 2.2 A + AA criteria', () => {
    expect(wcagCriteria.length).toBeGreaterThan(40);
    const levels = new Set(wcagCriteria.map(c => c.level));
    expect(levels.has('A')).toBe(true);
    expect(levels.has('AA')).toBe(true);
  });
});

describe('vpat plugin', () => {
  it('has correct name and commands', () => {
    expect(vpatPlugin.name).toBe('@ands/vpat');
    expect(vpatPlugin.topLevelCommands).toHaveLength(1);
    expect(vpatPlugin.topLevelCommands![0]!.name).toBe('vpat');
    expect(vpatPlugin.healthMetrics).toHaveLength(1);
  });
});
