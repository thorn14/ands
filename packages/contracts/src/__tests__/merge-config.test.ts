import { describe, it, expect } from 'vitest';
import { mergeConfig } from '../merge-config.js';
import type { AndsConfig } from '../config.js';

describe('mergeConfig', () => {
  it('returns override when base is empty', () => {
    const result = mergeConfig({}, { adapter: 'test' });
    expect(result.adapter).toBe('test');
  });

  it('returns base when override is empty', () => {
    const result = mergeConfig({ adapter: 'test' }, {});
    expect(result.adapter).toBe('test');
  });

  it('scalar: override wins', () => {
    const result = mergeConfig(
      { adapter: 'base' },
      { adapter: 'override' },
    );
    expect(result.adapter).toBe('override');
  });

  it('arrays (plugins): concatenated, not replaced', () => {
    const p1 = { name: 'plugin-a' };
    const p2 = { name: 'plugin-b' };
    const result = mergeConfig(
      { plugins: [p1] } as Partial<AndsConfig>,
      { plugins: [p2] } as Partial<AndsConfig>,
    );
    expect(result.plugins).toHaveLength(2);
  });

  it('arrays (content): concatenated', () => {
    const result = mergeConfig(
      { content: ['src/**'] },
      { content: ['lib/**'] },
    );
    expect(result.content).toEqual(['src/**', 'lib/**']);
  });

  it('arrays (adapters): concatenated', () => {
    const result = mergeConfig(
      { adapters: ['adapter-a'] },
      { adapters: ['adapter-b'] },
    );
    expect(result.adapters).toEqual(['adapter-a', 'adapter-b']);
  });

  it('nested object (enforcement): deep merged', () => {
    const result = mergeConfig(
      { enforcement: { tokens: { mode: 'error' }, props: { mode: 'warn' } } },
      { enforcement: { tokens: { mode: 'warn' } } },
    );
    expect(result.enforcement?.tokens?.mode).toBe('warn');
    expect(result.enforcement?.props?.mode).toBe('warn');
  });

  it('exclude directive: removes named items after merge', () => {
    const p1 = { name: 'plugin-a' };
    const p2 = { name: 'plugin-b' };
    const result = mergeConfig(
      { plugins: [p1, p2] } as Partial<AndsConfig>,
      { plugins: [{ exclude: 'plugin-a' }] } as Partial<AndsConfig>,
    );
    const plugins = result.plugins as Array<{ name: string }>;
    expect(plugins).toHaveLength(1);
    expect(plugins[0]!.name).toBe('plugin-b');
  });

  it('exclude directive: removes string adapters by value', () => {
    const result = mergeConfig(
      { adapters: ['adapter-a', 'adapter-b'] },
      { adapters: [{ exclude: 'adapter-a' }] } as Partial<AndsConfig>,
    );
    expect(result.adapters).toEqual(['adapter-b']);
  });

  it('nested arrays (mcp.upstreams): concatenated', () => {
    const result = mergeConfig(
      { mcp: { upstreams: [{ name: 'a', url: 'http://a', type: 'storybook' }] } },
      { mcp: { upstreams: [{ name: 'b', url: 'http://b', type: 'figma' }] } },
    );
    const upstreams = result.mcp?.upstreams as Array<{ name: string }>;
    expect(upstreams).toHaveLength(2);
  });

  it('nested arrays (mcp.upstreams): exclude works', () => {
    const result = mergeConfig(
      { mcp: { upstreams: [{ name: 'a', url: 'http://a', type: 'storybook' }] } },
      { mcp: { upstreams: [{ exclude: 'a' }] } } as Partial<AndsConfig>,
    );
    const upstreams = result.mcp?.upstreams as unknown[];
    expect(upstreams).toHaveLength(0);
  });

  it('three-way merge: defaults < preset < consumer', () => {
    const defaults: Partial<AndsConfig> = {
      adapter: 'default-adapter',
      enforcement: { tokens: { mode: 'warn' }, props: { mode: 'off' } },
    };
    const preset: Partial<AndsConfig> = {
      enforcement: { tokens: { mode: 'error' } },
      content: ['src/**'],
    };
    const consumer: Partial<AndsConfig> = {
      adapter: 'my-adapter',
      content: ['lib/**'],
    };

    const step1 = mergeConfig(defaults, preset);
    const result = mergeConfig(step1, consumer);

    expect(result.adapter).toBe('my-adapter');
    expect(result.enforcement?.tokens?.mode).toBe('error');
    expect(result.enforcement?.props?.mode).toBe('off');
    expect(result.content).toEqual(['src/**', 'lib/**']);
  });

  it('does not mutate inputs', () => {
    const base = { enforcement: { tokens: { mode: 'error' as const } } };
    const override = { enforcement: { tokens: { mode: 'warn' as const } } };
    mergeConfig(base, override);
    expect(base.enforcement.tokens.mode).toBe('error');
  });
});
