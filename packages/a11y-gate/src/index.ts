/**
 * @module @ands/a11y-gate
 * @description Reference plugin: a11y testing gate for ANDS governance.
 *
 * Three tiers of a11y testing:
 * - Tier 1 (static): eslint-plugin-jsx-a11y — catches common issues in source
 * - Tier 2 (rendered): axe-core + Playwright — tests rendered Storybook stories
 * - Tier 3 (page): Lighthouse + pa11y — tests staging URLs
 *
 * All testing tools are peer dependencies — install only what you need.
 */

export { a11yPlugin } from './plugin.js';
export { staticRunner } from './runners/static.js';
export { renderedRunner } from './runners/rendered.js';
export { pageRunner } from './runners/page.js';
