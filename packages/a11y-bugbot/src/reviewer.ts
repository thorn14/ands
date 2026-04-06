/**
 * @module reviewer
 * @description Core orchestrator: collects issues, sends to LLM, enriches results.
 */

import type { AndsConfig, AndsIssue, NarrativeProvider, CliOutput } from '@ands/contracts';
import { buildPrompt, type FileIssueGroup } from './prompt-builder.js';
import { parseResponse, type ReviewSuggestion } from './response-parser.js';
import { resolvePrContext, postSummaryComment } from './github-commenter.js';
import { readFileSync } from 'fs';

export interface ReviewResult {
  issues: AndsIssue[];
  suggestions: ReviewSuggestion[];
  posted: boolean;
}

/**
 * Run the full review flow:
 * 1. Resolve NarrativeProvider
 * 2. Group issues by file
 * 3. Build prompt, call LLM
 * 4. Parse response, enrich issues
 * 5. Optionally post to GitHub PR
 */
export async function runReview(
  issues: AndsIssue[],
  config: AndsConfig,
  options: { postComments?: boolean } = {},
): Promise<ReviewResult> {
  // Resolve narrative provider
  const providerName = config.narrative?.provider;
  let provider: NarrativeProvider | null = null;

  if (providerName) {
    try {
      const mod = await import(providerName);
      provider = mod.default ?? mod.provider ?? mod;
    } catch {
      // Provider not available
    }
  }

  if (!provider) {
    return {
      issues,
      suggestions: [],
      posted: false,
    };
  }

  // Group issues by file
  const fileGroups = new Map<string, AndsIssue[]>();
  for (const issue of issues) {
    const file = issue.loc?.file ?? 'unknown';
    const group = fileGroups.get(file) ?? [];
    group.push(issue);
    fileGroups.set(file, group);
  }

  // Build file issue groups with content
  const groups: FileIssueGroup[] = [];
  for (const [filePath, fileIssues] of fileGroups) {
    let content = '';
    try {
      content = readFileSync(filePath, 'utf8');
    } catch {
      // File might not exist (e.g., URL-based issues)
    }
    groups.push({ filePath, content, issues: fileIssues });
  }

  // Build prompt and call LLM
  const prompt = buildPrompt(groups);
  let suggestions: ReviewSuggestion[] = [];

  try {
    const model = config.narrative?.model;
    const response = await provider.generate(prompt.user, {
      config,
      ...(model !== undefined ? { model } : {}),
    });
    suggestions = parseResponse(response);
  } catch {
    // LLM call failed
  }

  // Enrich issues with suggestions
  const enrichedIssues = issues.map(issue => {
    const suggestion = suggestions.find(s => s.issueCode === issue.code);
    if (suggestion) {
      return {
        ...issue,
        hint: suggestion.explanation,
        suggestion: suggestion.fix,
      };
    }
    return issue;
  });

  // Post to GitHub if requested
  let posted = false;
  if (options.postComments && suggestions.length > 0) {
    const prCtx = resolvePrContext();
    if (prCtx) {
      posted = await postSummaryComment(prCtx, suggestions);
    }
  }

  return {
    issues: enrichedIssues,
    suggestions,
    posted,
  };
}
