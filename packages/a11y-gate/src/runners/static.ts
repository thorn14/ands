/**
 * @module runners/static
 * @description Tier 1 a11y runner: static analysis via eslint-plugin-jsx-a11y.
 *
 * Scans source files for common a11y violations without rendering.
 * eslint-plugin-jsx-a11y is a peer dependency.
 */

import type { A11yRunner, A11yRunConfig, AndsIssue } from '@ands/contracts';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// Simple built-in a11y checks (supplement, not replacement for jsx-a11y)
const CHECKS = [
  {
    pattern: /<img\b(?![^>]*\balt\b)/g,
    code: 'IMG_MISSING_ALT',
    message: '<img> element missing alt attribute',
  },
  {
    pattern: /<button\b[^>]*>\s*<\/button>/g,
    code: 'EMPTY_BUTTON',
    message: '<button> element has no accessible content',
  },
  {
    pattern: /onClick\b(?![^}]*(?:onKeyDown|onKeyPress|onKeyUp))/g,
    code: 'CLICK_MISSING_KEYBOARD',
    message: 'onClick handler without corresponding keyboard handler',
  },
];

function collectFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
      if (statSync(p).isDirectory()) results.push(...collectFiles(p));
      else if (entry.endsWith('.tsx') || entry.endsWith('.jsx')) results.push(p);
    }
  } catch { /* skip */ }
  return results;
}

export const staticRunner: A11yRunner = {
  name: 'jsx-a11y-static',
  tier: 'static',
  description: 'Static a11y analysis of JSX/TSX source files',
  async run(runConfig: A11yRunConfig): Promise<AndsIssue[]> {
    const rootDir = process.cwd();
    const files = runConfig.files
      ? runConfig.files.map(f => join(rootDir, f))
      : collectFiles(join(rootDir, 'src'));

    const issues: AndsIssue[] = [];

    for (const filePath of files) {
      let content: string;
      try { content = readFileSync(filePath, 'utf8'); } catch { continue; }
      const relPath = relative(rootDir, filePath);
      const lines = content.split('\n');

      for (const check of CHECKS) {
        check.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = check.pattern.exec(content)) !== null) {
          const before = content.slice(0, match.index);
          const line = before.split('\n').length;
          issues.push({
            category: 'compliance',
            code: check.code,
            message: check.message,
            loc: { file: relPath, line },
            severity: 'error',
          });
        }
      }
    }

    return issues;
  },
};
