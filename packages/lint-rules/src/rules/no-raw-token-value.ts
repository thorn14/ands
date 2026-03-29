/**
 * @module rules/no-raw-token-value
 * @description Detects hardcoded color/dimension values that should use token variables.
 */

import type { AndsLintRule, AndsLintContext, AndsIssue } from '@ands/contracts';

const HEX_COLOR_RE = /#[0-9A-Fa-f]{3,8}\b/g;
const DIMENSION_RE = /\b\d+(?:\.\d+)?(?:px|rem|em)\b/g;
const TOKEN_ACCESS_RE = /var\(--[a-z0-9-]+\)/;

const ALLOWED = new Set([
  '0', '0px', '0%', '100%', '50%',
  'transparent', 'inherit', 'initial', 'unset', 'currentColor', 'none',
]);

export const noRawTokenValue: AndsLintRule = {
  name: 'no-raw-token-value',
  description: 'Disallow hardcoded color and dimension values — use token variables instead',
  create(ctx: AndsLintContext): AndsIssue[] {
    const issues: AndsIssue[] = [];
    const lines = ctx.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      // Skip comments
      if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;

      for (const re of [HEX_COLOR_RE, DIMENSION_RE]) {
        re.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = re.exec(line)) !== null) {
          const value = match[0];
          if (ALLOWED.has(value)) continue;
          // Check if it's inside a var() — not a violation
          const before = line.slice(0, match.index);
          if (TOKEN_ACCESS_RE.test(before + value)) continue;

          issues.push({
            category: 'token',
            code: 'NO_RAW_TOKEN_VALUE',
            message: `Hardcoded value "${value}" — use a token variable instead`,
            loc: { file: ctx.filePath, line: i + 1, col: match.index },
            severity: 'error',
          });
        }
      }
    }

    return issues;
  },
};
