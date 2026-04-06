import { describe, it, expect } from 'vitest';
import { buildPrompt, type FileIssueGroup } from '../prompt-builder.js';
import type { AndsIssue } from '@ands/contracts';

describe('prompt-builder', () => {
  it('builds prompt from issue groups', () => {
    const groups: FileIssueGroup[] = [{
      filePath: 'src/Button.tsx',
      content: '<button></button>',
      issues: [{
        category: 'compliance',
        code: 'EMPTY_BUTTON',
        message: 'button has no content',
        severity: 'error',
        loc: { file: 'src/Button.tsx', line: 1 },
      }],
    }];

    const prompt = buildPrompt(groups);
    expect(prompt.system).toContain('accessibility expert');
    expect(prompt.user).toContain('EMPTY_BUTTON');
    expect(prompt.user).toContain('Button.tsx');
    expect(prompt.estimatedTokens).toBeGreaterThan(0);
  });

  it('handles empty groups', () => {
    const prompt = buildPrompt([]);
    expect(prompt.user).toContain('No issues');
  });

  it('truncates when exceeding token budget', () => {
    const largeContent = 'x'.repeat(50000);
    const groups: FileIssueGroup[] = [{
      filePath: 'src/Large.tsx',
      content: largeContent,
      issues: [{
        category: 'compliance',
        code: 'TEST',
        message: 'test issue',
        severity: 'warn',
      }],
    }];

    const prompt = buildPrompt(groups, 1000);
    expect(prompt.estimatedTokens).toBeLessThanOrEqual(1500); // some overhead
  });

  it('includes context lines around issues', () => {
    const content = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n');
    const groups: FileIssueGroup[] = [{
      filePath: 'src/test.tsx',
      content,
      issues: [{
        category: 'compliance',
        code: 'TEST',
        message: 'issue at line 10',
        severity: 'error',
        loc: { file: 'src/test.tsx', line: 10 },
      }],
    }];

    const prompt = buildPrompt(groups);
    expect(prompt.user).toContain('line 10');
  });
});
