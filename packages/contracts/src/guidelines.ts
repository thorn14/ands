/**
 * @module guidelines
 * @description Types for ANDS design-system guideline entries.
 *
 * Guidelines are indexed documents (accessibility rules, token usage policies,
 * naming conventions) that agents and humans can query via `ands guideline`.
 */

export interface GuidelineEntry {
  id: string;
  title: string;
  category: string;
  path: string;
  tags?: string[];
  description?: string;
}
