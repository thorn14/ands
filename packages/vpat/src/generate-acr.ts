/**
 * @module generate-acr
 * @description Generates an Accessibility Conformance Report (ACR) — a completed VPAT.
 *
 * An ACR is a filled-out VPAT that documents the actual state of a product's accessibility.
 */

import type { VpatReport, ConformanceLevel } from './generate-vpat.js';

export interface AcrSummary {
  productName: string;
  vendorName: string;
  productVersion: string;
  date: string;
  wcagLevel: string;
  overallConformance: ConformanceLevel;
  totalCriteria: number;
  criteriaBreakdown: Record<ConformanceLevel, number>;
  coveragePercentage: number;
}

/**
 * Generate an ACR summary from a VPAT report.
 */
export function generateAcr(report: VpatReport): AcrSummary {
  const total = report.criteria.length;
  const evaluated = total - report.summary.notEvaluated - report.summary.notApplicable;
  const coveragePercentage = total > 0 ? Math.round((evaluated / total) * 100) : 0;

  let overallConformance: ConformanceLevel;
  if (report.summary.doesNotSupport > 0) {
    overallConformance = 'Does Not Support';
  } else if (report.summary.partiallySupports > 0) {
    overallConformance = 'Partially Supports';
  } else if (report.summary.supports > 0) {
    overallConformance = 'Supports';
  } else {
    overallConformance = 'Not Evaluated';
  }

  return {
    productName: report.productName,
    vendorName: report.vendorName,
    productVersion: report.productVersion,
    date: report.date,
    wcagLevel: report.wcagLevel,
    overallConformance,
    totalCriteria: total,
    criteriaBreakdown: {
      'Supports': report.summary.supports,
      'Does Not Support': report.summary.doesNotSupport,
      'Partially Supports': report.summary.partiallySupports,
      'Not Applicable': report.summary.notApplicable,
      'Not Evaluated': report.summary.notEvaluated,
    },
    coveragePercentage,
  };
}
