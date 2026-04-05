/**
 * @module rules/pii-exposure
 * @description Lint rule: detect PII patterns (emails, SSNs, credit cards, etc.) in source code.
 *
 * Uses OXC parser for AST-aware detection:
 * - Skips PII patterns inside RegExp literals (validation code, not exposure)
 * - Skips test/fixture files
 * - Skips patterns in comments
 * - Only flags string literals that could expose PII
 */

import type { AndsLintRule, AndsLintContext, AndsIssue, AndsConfig } from '@ands/contracts';
import { createRequire } from 'node:module';

// ---------------------------------------------------------------------------
// PII pattern definitions
// ---------------------------------------------------------------------------

interface PiiPattern {
  name: string;
  category: string;
  pattern: RegExp;
  severity: 'error' | 'warn' | 'info';
}

const PII_PATTERNS: PiiPattern[] = [
  {
    name: 'SSN',
    category: 'ssn',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/,
    severity: 'error',
  },
  {
    name: 'Credit Card',
    category: 'credit-card',
    pattern: /\b(?:4\d{12}(?:\d{3})?|5[1-5]\d{14}|3[47]\d{13})\b/,
    severity: 'error',
  },
  {
    name: 'Email',
    category: 'email',
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
    severity: 'warn',
  },
  {
    name: 'Phone',
    category: 'phone',
    pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    severity: 'warn',
  },
  {
    name: 'IP Address',
    category: 'ip-address',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
    severity: 'info',
  },
];

// Files to skip (tests, fixtures, mocks)
const SKIP_FILE_PATTERNS = [
  /\/__tests__\//,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\/fixtures?\//,
  /\/mocks?\//,
  /\/__mocks__\//,
];

interface OxcNode {
  type: string;
  span?: { start: number; end: number };
  value?: string | OxcNode;
  raw?: string;
  [key: string]: unknown;
}

function walkAst(node: OxcNode, visitor: (n: OxcNode) => void): void {
  visitor(node);
  for (const key of Object.keys(node)) {
    const child = (node as any)[key];
    if (child && typeof child === 'object') {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && item.type) {
            walkAst(item, visitor);
          }
        }
      } else if (child.type) {
        walkAst(child, visitor);
      }
    }
  }
}

function getLineFromOffset(content: string, offset: number): number {
  return content.slice(0, offset).split('\n').length;
}

export const piiExposure: AndsLintRule = {
  name: 'pii-exposure',
  description: 'Detect PII patterns (emails, SSNs, credit cards, etc.) in source code',
  create(ctx: AndsLintContext): AndsIssue[] {
    const config = ctx.config as AndsConfig;
    const piiConfig = config.pii;
    if (piiConfig?.mode === 'off') return [];

    // Skip test/fixture files
    if (SKIP_FILE_PATTERNS.some(p => p.test(ctx.filePath))) return [];

    // Determine which categories to check
    const enabledCategories = piiConfig?.categories
      ? new Set(piiConfig.categories)
      : null; // null = all enabled

    const patterns = PII_PATTERNS.filter(
      p => !enabledCategories || enabledCategories.has(p.category as any),
    );

    // Try AST-based analysis first
    let parseModule: typeof import('oxc-parser');
    try {
      const esmRequire = createRequire(import.meta.url);
      parseModule = esmRequire('oxc-parser');
    } catch {
      // Fall back to regex-based analysis
      return runRegexPiiChecks(ctx, patterns);
    }

    const ext = ctx.filePath.endsWith('.tsx') ? 'tsx'
      : ctx.filePath.endsWith('.jsx') ? 'jsx'
      : ctx.filePath.endsWith('.ts') ? 'ts'
      : 'js';

    let ast: OxcNode;
    try {
      const result = (parseModule as any).parseSync(ctx.filePath, ctx.content, {
        sourceType: 'module',
        lang: ext,
      });
      ast = (result as any).program ?? (result as any).ast;
      if (!ast) return runRegexPiiChecks(ctx, patterns);
    } catch {
      return runRegexPiiChecks(ctx, patterns);
    }

    const issues: AndsIssue[] = [];

    walkAst(ast, (node: OxcNode) => {
      // Skip regex literals (validation patterns)
      if (node.type === 'RegExpLiteral') return;

      // Check string literals (OXC emits 'Literal', SWC/Babel emit 'StringLiteral')
      if (node.type === 'StringLiteral' || node.type === 'Literal' || node.type === 'TemplateLiteral') {
        const strValue = typeof node.value === 'string' ? node.value
          : node.raw ? String(node.raw) : null;

        if (!strValue) return;

        for (const piiPattern of patterns) {
          if (piiPattern.pattern.test(strValue)) {
            const line = node.span ? getLineFromOffset(ctx.content, node.span.start) : undefined;
            const severity = piiConfig?.mode === 'error' ? 'error' : piiPattern.severity;
            issues.push({
              category: 'compliance',
              code: 'PII_EXPOSURE',
              message: `Potential ${piiPattern.name} detected in string literal`,
              ...(line !== undefined ? { loc: { file: ctx.filePath, line } } : { loc: { file: ctx.filePath } }),
              severity,
              hint: `Review this string for PII. If it's a validation pattern, consider moving to a RegExp literal.`,
            });
            break; // One issue per string node
          }
        }
      }
    });

    return issues;
  },
};

// Regex-based fallback for non-parseable files
function runRegexPiiChecks(ctx: AndsLintContext, patterns: PiiPattern[]): AndsIssue[] {
  const issues: AndsIssue[] = [];
  const lines = ctx.content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // Skip comments
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;
    // Skip regex patterns (very basic heuristic)
    if (/\/.*\/[gimsuy]*/.test(line)) continue;

    for (const piiPattern of patterns) {
      if (piiPattern.pattern.test(line)) {
        issues.push({
          category: 'compliance',
          code: 'PII_EXPOSURE',
          message: `Potential ${piiPattern.name} detected`,
          loc: { file: ctx.filePath, line: i + 1 },
          severity: piiPattern.severity,
          hint: 'Review this line for PII exposure',
        });
        break; // One issue per line
      }
    }
  }

  return issues;
}
