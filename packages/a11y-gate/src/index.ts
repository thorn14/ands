/**
 * @module @ands/a11y-gate
 * @description Reference plugin: a11y testing gate for ANDS governance.
 *
 * Three tiers of a11y testing:
 * - Tier 1 (static): OXC AST analysis + aria-query — catches common issues in source
 * - Tier 2 (rendered): axe-core + Playwright — tests rendered Storybook stories
 * - Tier 3 (page): Lighthouse — tests staging URLs
 *
 * Tier 2/3 tools are peer dependencies — install only what you need.
 */

export { a11yPlugin } from './plugin.js';
export { staticRunner } from './runners/static.js';
export { renderedRunner } from './runners/rendered.js';
export { pageRunner } from './runners/page.js';
export { tryImport, peerNotInstalledIssue } from './resolve-peer.js';
