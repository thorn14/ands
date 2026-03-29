import { describe, it, expect } from 'vitest';
import { noRawTokenValue } from '../rules/no-raw-token-value.js';
import { noDeprecatedProp } from '../rules/no-deprecated-prop.js';
import { propNamingConsistency } from '../rules/prop-naming-consistency.js';
import type { AndsLintContext, AndsConfig } from '@ands/contracts';

function makeCtx(content: string, filePath = 'src/test.tsx', adapters = [{}] as AndsLintContext['adapters']): AndsLintContext {
  return {
    config: {} as AndsConfig,
    adapters,
    filePath,
    content,
  };
}

describe('no-raw-token-value', () => {
  it('flags hardcoded hex colors', () => {
    const issues = noRawTokenValue.create(makeCtx('const color = "#ff0000";'));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]!.code).toBe('NO_RAW_TOKEN_VALUE');
  });

  it('flags hardcoded px dimensions', () => {
    const issues = noRawTokenValue.create(makeCtx('margin: 16px;'));
    expect(issues.length).toBeGreaterThan(0);
  });

  it('allows var() token access', () => {
    const issues = noRawTokenValue.create(makeCtx('color: var(--brand-primary);'));
    expect(issues).toHaveLength(0);
  });

  it('allows 0px', () => {
    const issues = noRawTokenValue.create(makeCtx('margin: 0px;'));
    expect(issues).toHaveLength(0);
  });

  it('skips comment lines', () => {
    const issues = noRawTokenValue.create(makeCtx('// color: #ff0000;'));
    expect(issues).toHaveLength(0);
  });
});

describe('no-deprecated-prop', () => {
  it('flags deprecated props from adapters', () => {
    const ctx = makeCtx(
      '<Button isDisabled={true} />',
      'src/test.tsx',
      [{
        tokenMap: {},
        auditConfig: {},
        storybookUrl: '',
        deprecations: {
          'Button.isDisabled': { replacement: 'Button.disabled', since: '2.0', message: 'Use disabled' },
        },
      }],
    );
    const issues = noDeprecatedProp.create(ctx);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]!.code).toBe('NO_DEPRECATED_PROP');
  });

  it('passes when no deprecations', () => {
    const issues = noDeprecatedProp.create(makeCtx('<Button disabled={true} />'));
    expect(issues).toHaveLength(0);
  });
});

describe('prop-naming-consistency', () => {
  it('flags non-canonical prop names in tsx', () => {
    const ctx = makeCtx(
      '<Button buttonSize="lg" />',
      'src/test.tsx',
      [{
        tokenMap: {},
        auditConfig: {},
        storybookUrl: '',
        propConventions: { size: ['size', 'buttonSize'] },
      }],
    );
    const issues = propNamingConsistency.create(ctx);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]!.code).toBe('PROP_NAMING_INCONSISTENCY');
  });

  it('passes for canonical prop names', () => {
    const ctx = makeCtx(
      '<Button size="lg" />',
      'src/test.tsx',
      [{
        tokenMap: {},
        auditConfig: {},
        storybookUrl: '',
        propConventions: { size: ['size', 'buttonSize'] },
      }],
    );
    const issues = propNamingConsistency.create(ctx);
    expect(issues).toHaveLength(0);
  });

  it('skips non-tsx/jsx files', () => {
    const ctx = makeCtx(
      'buttonSize = "lg"',
      'src/test.ts',
      [{
        tokenMap: {},
        auditConfig: {},
        storybookUrl: '',
        propConventions: { size: ['size', 'buttonSize'] },
      }],
    );
    const issues = propNamingConsistency.create(ctx);
    expect(issues).toHaveLength(0);
  });
});
