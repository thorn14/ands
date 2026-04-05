/**
 * @module generate-vpat
 * @description Core VPAT 2.5 WCAG Edition report generator.
 *
 * Takes AndsIssue[] from a11y runners and produces a conformance report
 * mapping issues to WCAG 2.2 criteria.
 */

import type { AndsIssue, VpatConfig } from '@ands/contracts';
import { wcagCriteria, type WcagCriterion } from './wcag-criteria.js';
import { extractCriterionIdsFromIssue } from './axe-wcag-map.js';

export type ConformanceLevel =
  | 'Supports'
  | 'Does Not Support'
  | 'Partially Supports'
  | 'Not Applicable'
  | 'Not Evaluated';

export interface CriterionResult {
  criterion: WcagCriterion;
  conformance: ConformanceLevel;
  remarks: string;
  issueCount: number;
}

export interface VpatReport {
  productName: string;
  vendorName: string;
  productVersion: string;
  date: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  criteria: CriterionResult[];
  summary: {
    supports: number;
    doesNotSupport: number;
    partiallySupports: number;
    notApplicable: number;
    notEvaluated: number;
  };
}

/**
 * Map issues to WCAG criteria and determine conformance.
 */
function mapIssuesToCriteria(
  issues: AndsIssue[],
  targetLevel: 'A' | 'AA' | 'AAA',
): CriterionResult[] {
  // Build a map of criterion ID -> issues
  const criterionIssues = new Map<string, AndsIssue[]>();

  for (const issue of issues) {
    const criterionIds = extractCriterionIdsFromIssue(issue);
    for (const id of criterionIds) {
      const existing = criterionIssues.get(id) ?? [];
      existing.push(issue);
      criterionIssues.set(id, existing);
    }
  }

  // Filter criteria by target level
  const levelOrder: Record<string, number> = { A: 1, AA: 2, AAA: 3 };
  const targetOrder = levelOrder[targetLevel] ?? 2;
  const applicableCriteria = wcagCriteria.filter(
    c => (levelOrder[c.level] ?? 0) <= targetOrder,
  );

  return applicableCriteria.map(criterion => {
    const related = criterionIssues.get(criterion.id) ?? [];
    const hasAutomatedRules = criterion.axeRuleIds.length > 0 || criterion.lighthouseIds.length > 0;

    if (related.length === 0) {
      if (!hasAutomatedRules) {
        return {
          criterion,
          conformance: 'Not Evaluated' as ConformanceLevel,
          remarks: 'This criterion requires manual testing.',
          issueCount: 0,
        };
      }
      return {
        criterion,
        conformance: 'Supports' as ConformanceLevel,
        remarks: 'No issues detected by automated testing.',
        issueCount: 0,
      };
    }

    const hasErrors = related.some(i => i.severity === 'error');
    if (hasErrors) {
      return {
        criterion,
        conformance: 'Does Not Support' as ConformanceLevel,
        remarks: related.map(i => `${i.code}: ${i.message}`).join('; '),
        issueCount: related.length,
      };
    }

    return {
      criterion,
      conformance: 'Partially Supports' as ConformanceLevel,
      remarks: related.map(i => `${i.code}: ${i.message}`).join('; '),
      issueCount: related.length,
    };
  });
}

/**
 * Generate a VPAT report from a11y issues.
 */
export function generateVpat(
  issues: AndsIssue[],
  config?: VpatConfig,
): VpatReport {
  const wcagLevel = config?.wcagLevel ?? 'AA';
  const criteria = mapIssuesToCriteria(issues, wcagLevel);

  const summary = {
    supports: criteria.filter(c => c.conformance === 'Supports').length,
    doesNotSupport: criteria.filter(c => c.conformance === 'Does Not Support').length,
    partiallySupports: criteria.filter(c => c.conformance === 'Partially Supports').length,
    notApplicable: criteria.filter(c => c.conformance === 'Not Applicable').length,
    notEvaluated: criteria.filter(c => c.conformance === 'Not Evaluated').length,
  };

  return {
    productName: config?.productName ?? 'Unknown Product',
    vendorName: config?.vendorName ?? 'Unknown Vendor',
    productVersion: config?.productVersion ?? '0.0.0',
    date: new Date().toISOString().split('T')[0]!,
    wcagLevel,
    criteria,
    summary,
  };
}

/**
 * Format VPAT report as markdown (VPAT 2.5 WCAG Edition structure).
 */
export function vpatToMarkdown(report: VpatReport): string {
  const lines: string[] = [];
  lines.push(`# Voluntary Product Accessibility Template (VPAT®)`);
  lines.push(`## WCAG 2.2 Edition`);
  lines.push('');
  lines.push(`**Product Name:** ${report.productName}`);
  lines.push(`**Vendor:** ${report.vendorName}`);
  lines.push(`**Version:** ${report.productVersion}`);
  lines.push(`**Report Date:** ${report.date}`);
  lines.push(`**WCAG Level:** ${report.wcagLevel}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Conformance Level | Count |`);
  lines.push(`|---|---|`);
  lines.push(`| Supports | ${report.summary.supports} |`);
  lines.push(`| Partially Supports | ${report.summary.partiallySupports} |`);
  lines.push(`| Does Not Support | ${report.summary.doesNotSupport} |`);
  lines.push(`| Not Applicable | ${report.summary.notApplicable} |`);
  lines.push(`| Not Evaluated | ${report.summary.notEvaluated} |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Group by principle
  const principles = ['Perceivable', 'Operable', 'Understandable', 'Robust'];
  for (const principle of principles) {
    const criteriaForPrinciple = report.criteria.filter(c => c.criterion.principle === principle);
    if (criteriaForPrinciple.length === 0) continue;

    lines.push(`## ${principle}`);
    lines.push('');
    lines.push('| Criterion | Conformance Level | Remarks |');
    lines.push('|---|---|---|');
    for (const result of criteriaForPrinciple) {
      const c = result.criterion;
      lines.push(`| ${c.id} ${c.name} (Level ${c.level}) | ${result.conformance} | ${result.remarks} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format VPAT report as JSON.
 */
export function vpatToJson(report: VpatReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Format VPAT report as HTML.
 */
export function vpatToHtml(report: VpatReport): string {
  const rows = report.criteria.map(r => {
    const c = r.criterion;
    return `<tr><td>${c.id} ${c.name} (${c.level})</td><td>${r.conformance}</td><td>${r.remarks}</td></tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>VPAT - ${report.productName}</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
th { background: #f5f5f5; }
h1 { font-size: 1.5rem; }
h2 { font-size: 1.2rem; margin-top: 2rem; }
</style>
</head>
<body>
<h1>VPAT® — WCAG 2.2 Edition</h1>
<p><strong>Product:</strong> ${report.productName} v${report.productVersion}</p>
<p><strong>Vendor:</strong> ${report.vendorName}</p>
<p><strong>Date:</strong> ${report.date}</p>
<p><strong>Level:</strong> ${report.wcagLevel}</p>
<h2>Criteria</h2>
<table>
<thead><tr><th>Criterion</th><th>Conformance</th><th>Remarks</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</body>
</html>`;
}
