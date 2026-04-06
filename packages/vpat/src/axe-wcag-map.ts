/**
 * @module axe-wcag-map
 * @description Maps axe-core rule IDs to WCAG criterion IDs.
 *
 * axe-core tags follow the convention: `wcag111` -> WCAG 1.1.1
 */

/**
 * Extract WCAG criterion IDs from axe-core tags.
 * Tags like `wcag111` are parsed to `1.1.1`.
 */
export function axeTagsToCriterionIds(tags: string[]): string[] {
  const ids: string[] = [];
  for (const tag of tags) {
    const match = tag.match(/^wcag(\d)(\d+)(\d)$/);
    if (match) {
      ids.push(`${match[1]}.${match[2]}.${match[3]}`);
      continue;
    }
    // Try 2-digit format: wcag21 -> 2.1
    const matchGuideline = tag.match(/^wcag(\d)(\d)$/);
    if (matchGuideline) {
      // This is a guideline ref, not a criterion
      continue;
    }
  }
  return ids;
}

/**
 * Parse WCAG tags from an AndsIssue's path field.
 * Issues produced by the axe-core runner store WCAG tags in `path`.
 */
export function extractCriterionIdsFromIssue(issue: { path?: string[] }): string[] {
  if (!issue.path) return [];
  return axeTagsToCriterionIds(issue.path);
}
