/**
 * @module rules/no-deprecated-prop
 * @description Detects usage of deprecated props as declared by adapters.
 */

import type { AndsLintRule, AndsLintContext, AndsIssue } from '@ands/contracts';

export const noDeprecatedProp: AndsLintRule = {
  name: 'no-deprecated-prop',
  description: 'Disallow usage of deprecated props declared by DS adapters',
  create(ctx: AndsLintContext): AndsIssue[] {
    const issues: AndsIssue[] = [];

    // Collect all deprecations from all adapters
    const deprecations = new Map<string, { replacement: string; since?: string; message?: string }>();
    for (const adapter of ctx.adapters) {
      if (adapter.deprecations) {
        for (const [prop, info] of Object.entries(adapter.deprecations)) {
          deprecations.set(prop, info);
        }
      }
    }

    if (deprecations.size === 0) return issues;

    const lines = ctx.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      for (const [prop, info] of deprecations) {
        // Extract the prop name part (after the dot, or the whole thing)
        const propName = prop.includes('.') ? prop.split('.').pop()! : prop;
        // Look for prop usage in JSX-like syntax: propName= or propName={
        const re = new RegExp(`\\b${propName}\\s*[={]`, 'g');
        let match: RegExpExecArray | null;
        while ((match = re.exec(line)) !== null) {
          const issue: AndsIssue = {
            category: 'compliance',
            code: 'NO_DEPRECATED_PROP',
            message: `Deprecated prop "${prop}" — use "${info.replacement}" instead${info.message ? `: ${info.message}` : ''}`,
            loc: { file: ctx.filePath, line: i + 1, col: match.index },
            suggestion: `Replace ${propName} with ${info.replacement.includes('.') ? info.replacement.split('.').pop() : info.replacement}`,
            severity: 'error',
          };
          if (info.since) issue.hint = `Deprecated since ${info.since}`;
          issues.push(issue);
        }
      }
    }

    return issues;
  },
};
