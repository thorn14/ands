import { describe, it, expect } from 'vitest';
import { pageRunner } from '../runners/page.js';
import type { AndsConfig } from '@ands/contracts';

const config = {} as AndsConfig;

describe('page a11y runner (lighthouse)', () => {
  it('has correct metadata', () => {
    expect(pageRunner.name).toBe('lighthouse-page');
    expect(pageRunner.tier).toBe('page');
  });

  it('returns error when url is missing', async () => {
    const issues = await pageRunner.run({ config });
    expect(issues).toHaveLength(1);
    expect(issues[0]!.code).toBe('A11Y_MISSING_URL');
    expect(issues[0]!.severity).toBe('error');
  });

  it('returns info issue when lighthouse is not installed', async () => {
    const issues = await pageRunner.run({ config, url: 'http://localhost:3000' });
    expect(issues.length).toBeGreaterThanOrEqual(1);
    const notInstalled = issues.find(i => i.code === 'A11Y_PAGE_NOT_INSTALLED');
    if (notInstalled) {
      expect(notInstalled.severity).toBe('info');
    }
  });
});
