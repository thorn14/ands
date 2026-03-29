/**
 * Fixture source file for testing ANDS governance against.
 * This file intentionally contains both good and bad patterns
 * for CI testing.
 */

// Good: uses token variables
const goodColor = 'var(--color-brand-primary)';
const goodSpacing = 'var(--spacing-4)';

// Would be flagged by ands audit-tokens if token index contains this:
// const badColor = '#3B82F6';

export { goodColor, goodSpacing };
