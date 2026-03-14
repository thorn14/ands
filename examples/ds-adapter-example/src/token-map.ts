/**
 * @module token-map
 * @description Maps the host design system's tokens to ANDS TokenIndex format.
 *
 * **Adapter pattern:**
 * 1. Your host DS has tokens in its own format (CSS vars, JS object, JSON, etc.)
 * 2. This module maps them to a flat `Record<string, string | number>` (TokenIndex)
 * 3. The resulting `tokens.index.json` is used by `ands audit-tokens`
 *
 * **For this example**, we simulate "AcmeDS" — a hypothetical host design system
 * that exports a CSS variable naming convention like `--acme-color-primary`.
 * We map those to ANDS canonical paths (`color.brand.primary`).
 *
 * **Swapping DS:** Replace this file (and components/) when switching host DS.
 * The ANDS core contracts and interaction-kit patterns are unchanged.
 */

import type { TokenIndex } from '@ands/foundation-tokens';

// ---------------------------------------------------------------------------
// Simulated AcmeDS token values
// (In a real adapter, these would be imported from the host DS package)
// ---------------------------------------------------------------------------

const ACME_TOKENS = {
  // Colors
  '--acme-color-primary': '#3B82F6',
  '--acme-color-secondary': '#6366F1',
  '--acme-color-accent': '#F59E0B',
  '--acme-color-white': '#FFFFFF',
  '--acme-color-gray-100': '#F3F4F6',
  '--acme-color-gray-200': '#E5E7EB',
  '--acme-color-gray-500': '#6B7280',
  '--acme-color-gray-900': '#111827',
  '--acme-color-success': '#10B981',
  '--acme-color-warning': '#F59E0B',
  '--acme-color-error': '#EF4444',
  // Spacing
  '--acme-space-1': '4px',
  '--acme-space-2': '8px',
  '--acme-space-3': '12px',
  '--acme-space-4': '16px',
  '--acme-space-6': '24px',
  '--acme-space-8': '32px',
  // Typography
  '--acme-font-sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  '--acme-font-mono': 'ui-monospace, SFMono-Regular, Consolas, monospace',
  '--acme-text-sm': '0.875rem',
  '--acme-text-base': '1rem',
  '--acme-text-lg': '1.125rem',
  '--acme-font-regular': 400,
  '--acme-font-medium': 500,
  '--acme-font-bold': 700,
  // Borders
  '--acme-radius-sm': '4px',
  '--acme-radius-md': '6px',
  '--acme-radius-lg': '8px',
  '--acme-radius-full': '9999px',
  '--acme-border-thin': '1px',
  '--acme-border-base': '2px',
  // Shadows
  '--acme-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--acme-shadow-base': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  '--acme-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

// ---------------------------------------------------------------------------
// Mapping: AcmeDS variable name → ANDS canonical token path
// ---------------------------------------------------------------------------

const ACME_TO_ANDS_PATH: Record<string, string> = {
  '--acme-color-primary': 'color.brand.primary',
  '--acme-color-secondary': 'color.brand.secondary',
  '--acme-color-accent': 'color.brand.accent',
  '--acme-color-white': 'color.neutral.0',
  '--acme-color-gray-100': 'color.neutral.100',
  '--acme-color-gray-200': 'color.neutral.200',
  '--acme-color-gray-500': 'color.neutral.500',
  '--acme-color-gray-900': 'color.neutral.900',
  '--acme-color-success': 'color.semantic.success',
  '--acme-color-warning': 'color.semantic.warning',
  '--acme-color-error': 'color.semantic.error',
  '--acme-space-1': 'spacing.1',
  '--acme-space-2': 'spacing.2',
  '--acme-space-3': 'spacing.3',
  '--acme-space-4': 'spacing.4',
  '--acme-space-6': 'spacing.6',
  '--acme-space-8': 'spacing.8',
  '--acme-font-sans': 'typography.family.sans',
  '--acme-font-mono': 'typography.family.mono',
  '--acme-text-sm': 'typography.size.sm',
  '--acme-text-base': 'typography.size.base',
  '--acme-text-lg': 'typography.size.lg',
  '--acme-font-regular': 'typography.weight.regular',
  '--acme-font-medium': 'typography.weight.medium',
  '--acme-font-bold': 'typography.weight.bold',
  '--acme-radius-sm': 'border.radius.sm',
  '--acme-radius-md': 'border.radius.md',
  '--acme-radius-lg': 'border.radius.lg',
  '--acme-radius-full': 'border.radius.full',
  '--acme-border-thin': 'border.width.thin',
  '--acme-border-base': 'border.width.base',
  '--acme-shadow-sm': 'shadow.sm',
  '--acme-shadow-base': 'shadow.base',
  '--acme-shadow-lg': 'shadow.lg',
};

// ---------------------------------------------------------------------------
// Produce ANDS TokenIndex from AcmeDS tokens
// ---------------------------------------------------------------------------

/**
 * Produces the ANDS `TokenIndex` (flat path → value map) by reading
 * AcmeDS token values and mapping them to ANDS canonical paths.
 *
 * **Agents:** the output of this function is written to `tokens.index.json`
 * and consumed by `ands audit-tokens` to detect off-system hardcoded values.
 */
export function buildAdapterTokenIndex(): TokenIndex {
  const index: TokenIndex = {};
  for (const [acmeVar, andsPath] of Object.entries(ACME_TO_ANDS_PATH)) {
    const value = ACME_TOKENS[acmeVar as keyof typeof ACME_TOKENS];
    if (value !== undefined) {
      index[andsPath] = value as string | number;
    }
  }
  return index;
}

/**
 * The AcmeDS CSS variable name for a given ANDS token path.
 * Useful in adapter component implementations.
 *
 * @example acmeCssVar('color.brand.primary') // '--acme-color-primary'
 */
export function acmeCssVar(andsPath: string): string | undefined {
  const entry = Object.entries(ACME_TO_ANDS_PATH).find(([, v]) => v === andsPath);
  return entry?.[0];
}

/**
 * Get the CSS `var(...)` expression for an ANDS token path.
 * Falls back to the ANDS convention if no AcmeDS mapping exists.
 *
 * @example tokenVar('color.brand.primary') // 'var(--acme-color-primary)'
 */
export function tokenVar(andsPath: string): string {
  const acmeVar = acmeCssVar(andsPath);
  if (acmeVar) return `var(${acmeVar})`;
  // Fall back to ANDS convention
  return `var(--${andsPath.replace(/\./g, '-')})`;
}
