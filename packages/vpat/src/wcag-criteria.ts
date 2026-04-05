/**
 * @module wcag-criteria
 * @description Static map of WCAG 2.2 Level A + AA criteria.
 */

export interface WcagCriterion {
  id: string;
  name: string;
  level: 'A' | 'AA' | 'AAA';
  principle: string;
  guideline: string;
  axeRuleIds: string[];
  lighthouseIds: string[];
}

/**
 * WCAG 2.2 Level A + AA success criteria.
 * Each criterion lists known axe-core rule IDs and Lighthouse audit IDs that test it.
 */
export const wcagCriteria: WcagCriterion[] = [
  // Principle 1: Perceivable
  { id: '1.1.1', name: 'Non-text Content', level: 'A', principle: 'Perceivable', guideline: '1.1 Text Alternatives', axeRuleIds: ['image-alt', 'input-image-alt', 'area-alt', 'object-alt', 'role-img-alt', 'svg-img-alt'], lighthouseIds: ['image-alt'] },
  { id: '1.2.1', name: 'Audio-only and Video-only', level: 'A', principle: 'Perceivable', guideline: '1.2 Time-based Media', axeRuleIds: ['video-caption'], lighthouseIds: ['video-caption'] },
  { id: '1.2.2', name: 'Captions (Prerecorded)', level: 'A', principle: 'Perceivable', guideline: '1.2 Time-based Media', axeRuleIds: ['video-caption'], lighthouseIds: ['video-caption'] },
  { id: '1.2.3', name: 'Audio Description or Media Alternative', level: 'A', principle: 'Perceivable', guideline: '1.2 Time-based Media', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.2.5', name: 'Audio Description (Prerecorded)', level: 'AA', principle: 'Perceivable', guideline: '1.2 Time-based Media', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.3.1', name: 'Info and Relationships', level: 'A', principle: 'Perceivable', guideline: '1.3 Adaptable', axeRuleIds: ['aria-required-children', 'aria-required-parent', 'definition-list', 'dlitem', 'list', 'listitem', 'th-has-data-cells', 'td-headers-attr', 'table-fake-caption', 'p-as-heading'], lighthouseIds: ['list', 'listitem', 'definition-list', 'dlitem', 'th-has-data-cells'] },
  { id: '1.3.2', name: 'Meaningful Sequence', level: 'A', principle: 'Perceivable', guideline: '1.3 Adaptable', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.3.3', name: 'Sensory Characteristics', level: 'A', principle: 'Perceivable', guideline: '1.3 Adaptable', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.3.4', name: 'Orientation', level: 'AA', principle: 'Perceivable', guideline: '1.3 Adaptable', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA', principle: 'Perceivable', guideline: '1.3 Adaptable', axeRuleIds: ['autocomplete-valid'], lighthouseIds: [] },
  { id: '1.4.1', name: 'Use of Color', level: 'A', principle: 'Perceivable', guideline: '1.4 Distinguishable', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.4.2', name: 'Audio Control', level: 'A', principle: 'Perceivable', guideline: '1.4 Distinguishable', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', axeRuleIds: ['color-contrast'], lighthouseIds: ['color-contrast'] },
  { id: '1.4.4', name: 'Resize Text', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', axeRuleIds: ['meta-viewport'], lighthouseIds: ['meta-viewport'] },
  { id: '1.4.5', name: 'Images of Text', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.4.10', name: 'Reflow', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.4.11', name: 'Non-text Contrast', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.4.12', name: 'Text Spacing', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', axeRuleIds: [], lighthouseIds: [] },
  { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA', principle: 'Perceivable', guideline: '1.4 Distinguishable', axeRuleIds: [], lighthouseIds: [] },

  // Principle 2: Operable
  { id: '2.1.1', name: 'Keyboard', level: 'A', principle: 'Operable', guideline: '2.1 Keyboard Accessible', axeRuleIds: ['accesskeys', 'tabindex'], lighthouseIds: ['accesskeys'] },
  { id: '2.1.2', name: 'No Keyboard Trap', level: 'A', principle: 'Operable', guideline: '2.1 Keyboard Accessible', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.1.4', name: 'Character Key Shortcuts', level: 'A', principle: 'Operable', guideline: '2.1 Keyboard Accessible', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.2.1', name: 'Timing Adjustable', level: 'A', principle: 'Operable', guideline: '2.2 Enough Time', axeRuleIds: ['meta-refresh'], lighthouseIds: ['meta-refresh'] },
  { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A', principle: 'Operable', guideline: '2.2 Enough Time', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.3.1', name: 'Three Flashes or Below Threshold', level: 'A', principle: 'Operable', guideline: '2.3 Seizures and Physical Reactions', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.4.1', name: 'Bypass Blocks', level: 'A', principle: 'Operable', guideline: '2.4 Navigable', axeRuleIds: ['bypass', 'region'], lighthouseIds: ['bypass'] },
  { id: '2.4.2', name: 'Page Titled', level: 'A', principle: 'Operable', guideline: '2.4 Navigable', axeRuleIds: ['document-title'], lighthouseIds: ['document-title'] },
  { id: '2.4.3', name: 'Focus Order', level: 'A', principle: 'Operable', guideline: '2.4 Navigable', axeRuleIds: ['tabindex'], lighthouseIds: ['tabindex'] },
  { id: '2.4.4', name: 'Link Purpose (In Context)', level: 'A', principle: 'Operable', guideline: '2.4 Navigable', axeRuleIds: ['link-name'], lighthouseIds: ['link-name'] },
  { id: '2.4.5', name: 'Multiple Ways', level: 'AA', principle: 'Operable', guideline: '2.4 Navigable', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.4.6', name: 'Headings and Labels', level: 'AA', principle: 'Operable', guideline: '2.4 Navigable', axeRuleIds: ['empty-heading'], lighthouseIds: ['heading-order'] },
  { id: '2.4.7', name: 'Focus Visible', level: 'AA', principle: 'Operable', guideline: '2.4 Navigable', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.4.11', name: 'Focus Not Obscured (Minimum)', level: 'AA', principle: 'Operable', guideline: '2.4 Navigable', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.5.1', name: 'Pointer Gestures', level: 'A', principle: 'Operable', guideline: '2.5 Input Modalities', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.5.2', name: 'Pointer Cancellation', level: 'A', principle: 'Operable', guideline: '2.5 Input Modalities', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.5.3', name: 'Label in Name', level: 'A', principle: 'Operable', guideline: '2.5 Input Modalities', axeRuleIds: ['label-content-name-mismatch'], lighthouseIds: [] },
  { id: '2.5.4', name: 'Motion Actuation', level: 'A', principle: 'Operable', guideline: '2.5 Input Modalities', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.5.7', name: 'Dragging Movements', level: 'AA', principle: 'Operable', guideline: '2.5 Input Modalities', axeRuleIds: [], lighthouseIds: [] },
  { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA', principle: 'Operable', guideline: '2.5 Input Modalities', axeRuleIds: ['target-size'], lighthouseIds: [] },

  // Principle 3: Understandable
  { id: '3.1.1', name: 'Language of Page', level: 'A', principle: 'Understandable', guideline: '3.1 Readable', axeRuleIds: ['html-has-lang', 'html-lang-valid', 'html-xml-lang-mismatch'], lighthouseIds: ['html-has-lang', 'html-lang-valid'] },
  { id: '3.1.2', name: 'Language of Parts', level: 'AA', principle: 'Understandable', guideline: '3.1 Readable', axeRuleIds: ['valid-lang'], lighthouseIds: [] },
  { id: '3.2.1', name: 'On Focus', level: 'A', principle: 'Understandable', guideline: '3.2 Predictable', axeRuleIds: [], lighthouseIds: [] },
  { id: '3.2.2', name: 'On Input', level: 'A', principle: 'Understandable', guideline: '3.2 Predictable', axeRuleIds: [], lighthouseIds: [] },
  { id: '3.2.3', name: 'Consistent Navigation', level: 'AA', principle: 'Understandable', guideline: '3.2 Predictable', axeRuleIds: [], lighthouseIds: [] },
  { id: '3.2.4', name: 'Consistent Identification', level: 'AA', principle: 'Understandable', guideline: '3.2 Predictable', axeRuleIds: [], lighthouseIds: [] },
  { id: '3.2.6', name: 'Consistent Help', level: 'A', principle: 'Understandable', guideline: '3.2 Predictable', axeRuleIds: [], lighthouseIds: [] },
  { id: '3.3.1', name: 'Error Identification', level: 'A', principle: 'Understandable', guideline: '3.3 Input Assistance', axeRuleIds: [], lighthouseIds: [] },
  { id: '3.3.2', name: 'Labels or Instructions', level: 'A', principle: 'Understandable', guideline: '3.3 Input Assistance', axeRuleIds: ['label', 'input-button-name', 'select-name'], lighthouseIds: ['label', 'input-button-name'] },
  { id: '3.3.3', name: 'Error Suggestion', level: 'AA', principle: 'Understandable', guideline: '3.3 Input Assistance', axeRuleIds: [], lighthouseIds: [] },
  { id: '3.3.4', name: 'Error Prevention (Legal, Financial, Data)', level: 'AA', principle: 'Understandable', guideline: '3.3 Input Assistance', axeRuleIds: [], lighthouseIds: [] },
  { id: '3.3.7', name: 'Redundant Entry', level: 'A', principle: 'Understandable', guideline: '3.3 Input Assistance', axeRuleIds: [], lighthouseIds: [] },
  { id: '3.3.8', name: 'Accessible Authentication (Minimum)', level: 'AA', principle: 'Understandable', guideline: '3.3 Input Assistance', axeRuleIds: [], lighthouseIds: [] },

  // Principle 4: Robust
  { id: '4.1.2', name: 'Name, Role, Value', level: 'A', principle: 'Robust', guideline: '4.1 Compatible', axeRuleIds: ['aria-allowed-attr', 'aria-hidden-body', 'aria-input-field-name', 'aria-toggle-field-name', 'aria-valid-attr-value', 'aria-valid-attr', 'button-name', 'form-field-multiple-labels', 'frame-title', 'image-alt', 'input-button-name', 'label', 'link-name', 'select-name'], lighthouseIds: ['aria-allowed-attr', 'aria-valid-attr-value', 'aria-valid-attr', 'button-name', 'frame-title', 'link-name'] },
  { id: '4.1.3', name: 'Status Messages', level: 'AA', principle: 'Robust', guideline: '4.1 Compatible', axeRuleIds: ['aria-allowed-role'], lighthouseIds: [] },
];

/**
 * Build a lookup from WCAG criterion ID to criterion object.
 */
export function buildCriteriaMap(): Map<string, WcagCriterion> {
  const map = new Map<string, WcagCriterion>();
  for (const c of wcagCriteria) {
    map.set(c.id, c);
  }
  return map;
}
