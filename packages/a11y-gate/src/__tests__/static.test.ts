import { describe, it, expect } from 'vitest';
import { staticRunner } from '../runners/static.js';
import type { AndsConfig } from '@ands/contracts';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const TEMP_DIR = join(process.cwd(), '.test-a11y-tmp');

describe('static a11y runner', () => {
  it('has correct metadata', () => {
    expect(staticRunner.name).toBe('jsx-a11y-static');
    expect(staticRunner.tier).toBe('static');
  });

  it('returns empty issues for empty file list', async () => {
    const issues = await staticRunner.run({
      config: {} as AndsConfig,
      files: [],
    });
    expect(issues).toHaveLength(0);
  });
});
