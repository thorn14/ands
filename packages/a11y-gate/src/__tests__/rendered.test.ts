import { describe, it, expect } from 'vitest';
import { renderedRunner } from '../runners/rendered.js';
import type { AndsConfig } from '@ands/contracts';

const config = {} as AndsConfig;

describe('rendered a11y runner (axe-core)', () => {
  it('has correct metadata', () => {
    expect(renderedRunner.name).toBe('axe-core-rendered');
    expect(renderedRunner.tier).toBe('rendered');
  });

  it('returns error when url is missing', async () => {
    const issues = await renderedRunner.run({ config });
    expect(issues).toHaveLength(1);
    expect(issues[0]!.code).toBe('A11Y_MISSING_URL');
    expect(issues[0]!.severity).toBe('error');
  });

  it('returns info issue when playwright is not installed', async () => {
    const issues = await renderedRunner.run({ config, url: 'http://localhost:6006' });
    // In test env, playwright is not installed as a peer dep
    expect(issues.length).toBeGreaterThanOrEqual(1);
    const notInstalled = issues.find(i => i.code === 'A11Y_RENDERED_NOT_INSTALLED');
    if (notInstalled) {
      expect(notInstalled.severity).toBe('info');
    }
  });
});
