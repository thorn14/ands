/**
 * @module prompt-builder
 * @description Constructs LLM prompts from a11y/lint issues + file context.
 */

import type { AndsIssue } from '@ands/contracts';

export interface FileIssueGroup {
  filePath: string;
  content: string;
  issues: AndsIssue[];
}

export interface BuiltPrompt {
  system: string;
  user: string;
  estimatedTokens: number;
}

const SYSTEM_PROMPT = `You are an accessibility expert reviewing code for WCAG 2.2 compliance.
For each issue, provide:
1. A specific code fix in diff format
2. A brief explanation of the accessibility impact
3. The relevant WCAG criterion

Respond with a JSON array of objects:
[{ "issueCode": "...", "fix": "...", "explanation": "...", "wcagCriterion": "..." }]`;

const CHARS_PER_TOKEN = 4; // rough estimate

/**
 * Build a prompt for the LLM from grouped issues.
 */
export function buildPrompt(
  groups: FileIssueGroup[],
  maxTokens = 8000,
): BuiltPrompt {
  const userParts: string[] = [];
  let totalChars = SYSTEM_PROMPT.length;
  const maxChars = maxTokens * CHARS_PER_TOKEN;

  for (const group of groups) {
    const header = `\n## File: ${group.filePath}\n`;
    const issueList = group.issues.map(i =>
      `- [${i.severity ?? 'warn'}] ${i.code}: ${i.message}${i.loc?.line ? ` (line ${i.loc.line})` : ''}`
    ).join('\n');

    // Extract context lines around issues
    const lines = group.content.split('\n');
    const contextLines = new Set<number>();
    for (const issue of group.issues) {
      if (issue.loc?.line) {
        const start = Math.max(0, issue.loc.line - 3);
        const end = Math.min(lines.length, issue.loc.line + 3);
        for (let i = start; i < end; i++) contextLines.add(i);
      }
    }

    let contextBlock: string;
    if (contextLines.size > 0) {
      const sortedLines = [...contextLines].sort((a, b) => a - b);
      contextBlock = sortedLines.map(i => `${i + 1}: ${lines[i] ?? ''}`).join('\n');
    } else {
      // Truncate full content if too large
      const maxContentChars = Math.min(group.content.length, 2000);
      contextBlock = group.content.slice(0, maxContentChars);
      if (group.content.length > maxContentChars) contextBlock += '\n... (truncated)';
    }

    const part = `${header}\n### Issues:\n${issueList}\n\n### Context:\n\`\`\`\n${contextBlock}\n\`\`\`\n`;
    const partChars = part.length;

    if (totalChars + partChars > maxChars) break;
    totalChars += partChars;
    userParts.push(part);
  }

  const user = userParts.length > 0
    ? `Review the following accessibility issues and suggest fixes:\n${userParts.join('\n')}`
    : 'No issues to review.';

  return {
    system: SYSTEM_PROMPT,
    user,
    estimatedTokens: Math.ceil(totalChars / CHARS_PER_TOKEN),
  };
}
