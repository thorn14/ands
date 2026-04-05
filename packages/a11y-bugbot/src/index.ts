/**
 * @module @ands/a11y-bugbot
 * @description LLM-powered a11y review bot for ANDS.
 *
 * Collects issues from a11y/lint, generates fix suggestions via NarrativeProvider,
 * and posts as PR comments.
 */

export { a11yBugbotPlugin } from './plugin.js';
export { runReview, type ReviewResult } from './reviewer.js';
export { buildPrompt, type FileIssueGroup, type BuiltPrompt } from './prompt-builder.js';
export { parseResponse, type ReviewSuggestion } from './response-parser.js';
export { resolvePrContext, postSummaryComment, postInlineComments } from './github-commenter.js';
