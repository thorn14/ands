import { describe, it, expectTypeOf } from 'vitest';
import type { AndsAdapter } from '../adapter.js';
import type { AuditConfig } from '../audit.js';

describe('AndsAdapter type', () => {
  it('requires tokenMap, auditConfig, storybookUrl', () => {
    expectTypeOf<AndsAdapter>().toHaveProperty('tokenMap');
    expectTypeOf<AndsAdapter>().toHaveProperty('auditConfig');
    expectTypeOf<AndsAdapter>().toHaveProperty('storybookUrl');
  });

  it('auditConfig satisfies AuditConfig', () => {
    expectTypeOf<AndsAdapter['auditConfig']>().toMatchTypeOf<AuditConfig>();
  });

  it('propConventions and deprecations are optional', () => {
    const adapter: AndsAdapter = {
      tokenMap: { 'color.brand': '--brand' },
      auditConfig: {},
      storybookUrl: 'https://example.com',
    };
    expectTypeOf(adapter).toMatchTypeOf<AndsAdapter>();
  });

  it('deprecations have the expected shape', () => {
    const adapter: AndsAdapter = {
      tokenMap: {},
      auditConfig: {},
      storybookUrl: 'https://example.com',
      deprecations: {
        'Button.type': {
          replacement: 'Button.variant',
          since: '3.0.0',
          message: 'type was renamed to variant',
        },
      },
    };
    expectTypeOf(adapter.deprecations).toMatchTypeOf<
      Record<string, { replacement: string; since?: string; message?: string }> | undefined
    >();
  });
});
