/**
 * @module @ands/vpat
 * @description VPAT 2.5 WCAG Edition report generator for ANDS.
 *
 * Generates Voluntary Product Accessibility Templates and Accessibility
 * Conformance Reports from a11y test results.
 */

export { vpatPlugin } from './plugin.js';
export { wcagCriteria, buildCriteriaMap, type WcagCriterion } from './wcag-criteria.js';
export { axeTagsToCriterionIds, extractCriterionIdsFromIssue } from './axe-wcag-map.js';
export { lighthouseAuditToCriterionIds } from './lighthouse-wcag-map.js';
export {
  generateVpat,
  vpatToMarkdown,
  vpatToJson,
  vpatToHtml,
  type VpatReport,
  type CriterionResult,
  type ConformanceLevel,
} from './generate-vpat.js';
export { generateAcr, type AcrSummary } from './generate-acr.js';
