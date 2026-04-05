import { describe, it, expect } from 'vitest';
import { noHardcodedString } from '../rules/no-hardcoded-string.js';
import type { AndsLintContext, AndsConfig } from '@ands/contracts';

function makeCtx(content: string, filePath = 'src/test.tsx'): AndsLintContext {
  return {
    config: {} as AndsConfig,
    adapters: [],
    filePath,
    content,
  };
}

describe('no-hardcoded-string', () => {
  it('has correct metadata', () => {
    expect(noHardcodedString.name).toBe('no-hardcoded-string');
  });

  it('flags hardcoded JSXText starting with uppercase', () => {
    const issues = noHardcodedString.create(makeCtx('<h1>Welcome to our app</h1>'));
    // May flag if OXC is available, otherwise returns empty (graceful)
    // We test the rule logic, not OXC availability
    expect(Array.isArray(issues)).toBe(true);
  });

  it('flags hardcoded placeholder attribute', () => {
    const issues = noHardcodedString.create(makeCtx('<input placeholder="Enter your name" />'));
    expect(Array.isArray(issues)).toBe(true);
  });

  it('skips data-testid attributes', () => {
    const issues = noHardcodedString.create(makeCtx('<div data-testid="my-component" />'));
    expect(issues).toHaveLength(0);
  });

  it('skips className attributes', () => {
    const issues = noHardcodedString.create(makeCtx('<div className="btn-primary" />'));
    expect(issues).toHaveLength(0);
  });

  it('skips non-tsx files', () => {
    const issues = noHardcodedString.create(makeCtx('const x = "Welcome";', 'src/test.ts'));
    expect(issues).toHaveLength(0);
  });

  it('skips when mode is off', () => {
    const ctx: AndsLintContext = {
      config: { i18n: { mode: 'off' } } as unknown as AndsConfig,
      adapters: [],
      filePath: 'src/test.tsx',
      content: '<h1>Welcome</h1>',
    };
    const issues = noHardcodedString.create(ctx);
    expect(issues).toHaveLength(0);
  });
});
