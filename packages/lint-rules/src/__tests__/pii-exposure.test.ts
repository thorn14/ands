import { describe, it, expect } from 'vitest';
import { piiExposure } from '../rules/pii-exposure.js';
import type { AndsLintContext, AndsConfig } from '@ands/contracts';

function makeCtx(content: string, filePath = 'src/utils.ts'): AndsLintContext {
  return {
    config: {} as AndsConfig,
    adapters: [],
    filePath,
    content,
  };
}

describe('pii-exposure', () => {
  it('has correct metadata', () => {
    expect(piiExposure.name).toBe('pii-exposure');
  });

  it('flags SSN patterns', () => {
    const issues = piiExposure.create(makeCtx('const ssn = "123-45-6789";'));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]!.code).toBe('PII_EXPOSURE');
  });

  it('flags email patterns', () => {
    const issues = piiExposure.create(makeCtx('const email = "user@example.com";'));
    expect(issues.length).toBeGreaterThan(0);
  });

  it('flags credit card patterns', () => {
    const issues = piiExposure.create(makeCtx('const card = "4111111111111111";'));
    expect(issues.length).toBeGreaterThan(0);
  });

  it('skips test files', () => {
    const issues = piiExposure.create(makeCtx(
      'const ssn = "123-45-6789";',
      'src/__tests__/validate.test.ts',
    ));
    expect(issues).toHaveLength(0);
  });

  it('skips when mode is off', () => {
    const ctx: AndsLintContext = {
      config: { pii: { mode: 'off' } } as unknown as AndsConfig,
      adapters: [],
      filePath: 'src/utils.ts',
      content: 'const ssn = "123-45-6789";',
    };
    const issues = piiExposure.create(ctx);
    expect(issues).toHaveLength(0);
  });
});
