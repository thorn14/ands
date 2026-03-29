/**
 * @module scaffold-templates/ds-adapter
 * @description Scaffold template for the `ds-adapter` pattern.
 *
 * Generates a minimal DS adapter that satisfies `AndsAdapter` from `@ands/contracts`.
 * Run: `ands scaffold --pattern ds-adapter --output ./my-adapter --name my-ds`
 */

import type { ScaffoldFile, ScaffoldOptions } from '@ands/contracts';

export function dsAdapterScaffoldFiles(opts: ScaffoldOptions): ScaffoldFile[] {
  return [
    { filename: 'src/index.ts', content: indexFile(opts) },
    { filename: 'src/token-map.ts', content: tokenMapFile(opts) },
    { filename: 'src/audit-config.ts', content: auditConfigFile(opts) },
    { filename: 'package.json', content: packageJsonFile(opts) },
    { filename: 'tsconfig.json', content: tsconfigFile() },
  ];
}

function indexFile(opts: ScaffoldOptions): string {
  return `/**
 * @module ${opts.name} adapter
 * @description ANDS adapter for the ${opts.name} design system.
 *
 * This is a data-only adapter — no component wrapping, no lifecycle.
 * Fill in tokenMap, auditConfig, and storybookUrl for your DS.
 */
import type { AndsAdapter } from '@ands/contracts';
import { tokenMap } from './token-map.js';
import { auditConfig } from './audit-config.js';

const adapter: AndsAdapter = {
  tokenMap,
  auditConfig,
  storybookUrl: 'https://your-storybook-url.example.com',
  propConventions: {
    variant: ['variant'],
    size: ['size'],
    disabled: ['disabled'],
  },
  deprecations: {},
};

export default adapter;
`;
}

function tokenMapFile(opts: ScaffoldOptions): string {
  return `/**
 * Token map for ${opts.name}.
 * Maps ANDS token dotted paths to your DS CSS variable names.
 */
export const tokenMap: Record<string, string> = {
  'color.brand.primary': '--${opts.name}-color-brand-primary',
  'color.brand.secondary': '--${opts.name}-color-brand-secondary',
  'color.neutral.0': '--${opts.name}-color-neutral-0',
  'color.neutral.100': '--${opts.name}-color-neutral-100',
  'spacing.4': '--${opts.name}-space-4',
  'spacing.6': '--${opts.name}-space-6',
  // Add more token mappings as needed
};
`;
}

function auditConfigFile(opts: ScaffoldOptions): string {
  return `/**
 * Audit configuration for ${opts.name}.
 */
import type { AuditConfig } from '@ands/contracts';

export const auditConfig: AuditConfig = {
  scanDirs: ['src'],
  extensions: ['.css', '.ts', '.tsx', '.js', '.jsx', '.scss'],
  rawValuePatterns: [/#[0-9a-f]{3,6}/i, /\\d+px/],
  tokenPrefix: '--${opts.name}-',
  ignoreFiles: ['**/vendor/**', '**/node_modules/**'],
};
`;
}

function packageJsonFile(opts: ScaffoldOptions): string {
  return JSON.stringify(
    {
      name: `@your-org/${opts.name}-ands-adapter`,
      version: '0.1.0',
      description: `ANDS adapter for the ${opts.name} design system`,
      type: 'module',
      main: './dist/index.js',
      types: './dist/index.d.ts',
      exports: {
        '.': {
          import: './dist/index.js',
          types: './dist/index.d.ts',
        },
      },
      scripts: {
        build: 'tsc --build',
        typecheck: 'tsc --noEmit',
      },
      dependencies: {
        '@ands/contracts': 'workspace:*',
      },
      devDependencies: {
        typescript: '^5.4.5',
      },
    },
    null,
    2,
  ) + '\n';
}

function tsconfigFile(): string {
  return JSON.stringify(
    {
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        outDir: './dist',
        rootDir: './src',
        composite: true,
      },
      include: ['src/**/*'],
    },
    null,
    2,
  ) + '\n';
}
