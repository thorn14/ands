/**
 * @module adapter
 * @description `AndsAdapter` — the data contract for connecting a design system to ANDS.
 *
 * An adapter is a plain object: token map, audit config, Storybook URL, and optional
 * prop conventions and deprecation data. No class, no constructor, no lifecycle.
 *
 * @example
 * ```ts
 * import type { AndsAdapter } from '@ands/contracts';
 *
 * export default {
 *   tokenMap: { 'color.brand.primary': '--acme-color-brand' },
 *   auditConfig: { rawValuePatterns: [/#[0-9a-f]{3,6}/i], tokenPrefix: '--acme-' },
 *   storybookUrl: 'https://acme.design/storybook',
 * } satisfies AndsAdapter;
 * ```
 */

import type { AuditConfig } from './audit.js';

export interface AndsAdapter {
  /** Maps ANDS token dotted paths to host DS CSS variable names or values. */
  tokenMap: Record<string, string | number>;
  /** Configuration for `ands audit-tokens`. */
  auditConfig: AuditConfig;
  /** URL of the host DS Storybook instance. */
  storybookUrl: string;
  /** Maps canonical prop names to DS-specific aliases. */
  propConventions?: Record<string, string[]>;
  /** Maps deprecated prop paths to their replacements. */
  deprecations?: Record<string, { replacement: string; since?: string; message?: string }>;
}
