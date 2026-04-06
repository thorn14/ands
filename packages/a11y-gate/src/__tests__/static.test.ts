import { describe, it, expect } from 'vitest';
import { staticRunner } from '../runners/static.js';
import type { AndsConfig } from '@ands/contracts';

const config = {} as AndsConfig;

describe('static a11y runner (OXC)', () => {
  it('has correct metadata', () => {
    expect(staticRunner.name).toBe('oxc-static');
    expect(staticRunner.tier).toBe('static');
  });

  it('returns empty issues for empty file list', async () => {
    const issues = await staticRunner.run({ config, files: [] });
    expect(issues).toHaveLength(0);
  });
});
