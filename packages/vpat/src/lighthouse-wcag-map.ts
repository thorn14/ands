/**
 * @module lighthouse-wcag-map
 * @description Maps Lighthouse audit IDs to WCAG criterion IDs.
 */

const LIGHTHOUSE_TO_WCAG: Record<string, string[]> = {
  'image-alt': ['1.1.1'],
  'video-caption': ['1.2.1', '1.2.2'],
  'color-contrast': ['1.4.3'],
  'meta-viewport': ['1.4.4'],
  'list': ['1.3.1'],
  'listitem': ['1.3.1'],
  'definition-list': ['1.3.1'],
  'dlitem': ['1.3.1'],
  'th-has-data-cells': ['1.3.1'],
  'accesskeys': ['2.1.1'],
  'meta-refresh': ['2.2.1'],
  'bypass': ['2.4.1'],
  'document-title': ['2.4.2'],
  'tabindex': ['2.4.3'],
  'link-name': ['2.4.4', '4.1.2'],
  'heading-order': ['2.4.6'],
  'html-has-lang': ['3.1.1'],
  'html-lang-valid': ['3.1.1'],
  'label': ['3.3.2', '4.1.2'],
  'input-button-name': ['3.3.2', '4.1.2'],
  'aria-allowed-attr': ['4.1.2'],
  'aria-valid-attr-value': ['4.1.2'],
  'aria-valid-attr': ['4.1.2'],
  'button-name': ['4.1.2'],
  'frame-title': ['4.1.2'],
};

/**
 * Get WCAG criterion IDs for a Lighthouse audit ID.
 */
export function lighthouseAuditToCriterionIds(auditId: string): string[] {
  return LIGHTHOUSE_TO_WCAG[auditId] ?? [];
}
