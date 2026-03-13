/**
 * @module tokens
 * @description ANDS reference token set (opinionated preset).
 *
 * This is the OPTIONAL preset layer. Adapters for existing design systems
 * should NOT import this — they should provide their own token mapping via
 * `@ands/ds-adapter-*` packages.
 *
 * Structure follows DTCG conventions:
 *   - `$type` on group → inherited by children
 *   - `$value` on leaf → the actual token value
 *   - `$description` on any node → documentation
 */

import type { TokenGroup } from './schema.js';

export const referenceTokens: TokenGroup = {
  color: {
    $type: 'color',
    $description: 'Color tokens',
    brand: {
      primary: { $value: '#3B82F6', $description: 'Primary brand color (blue-500)' },
      secondary: { $value: '#6366F1', $description: 'Secondary brand color (indigo-500)' },
      accent: { $value: '#F59E0B', $description: 'Accent color (amber-500)' },
    },
    neutral: {
      '0': { $value: '#FFFFFF', $description: 'White' },
      '50': { $value: '#F9FAFB', $description: 'Gray-50' },
      '100': { $value: '#F3F4F6', $description: 'Gray-100' },
      '200': { $value: '#E5E7EB', $description: 'Gray-200' },
      '300': { $value: '#D1D5DB', $description: 'Gray-300' },
      '400': { $value: '#9CA3AF', $description: 'Gray-400' },
      '500': { $value: '#6B7280', $description: 'Gray-500' },
      '600': { $value: '#4B5563', $description: 'Gray-600' },
      '700': { $value: '#374151', $description: 'Gray-700' },
      '800': { $value: '#1F2937', $description: 'Gray-800' },
      '900': { $value: '#111827', $description: 'Gray-900' },
      '950': { $value: '#030712', $description: 'Gray-950' },
    },
    semantic: {
      success: { $value: '#10B981', $description: 'Success (emerald-500)' },
      warning: { $value: '#F59E0B', $description: 'Warning (amber-500)' },
      error: { $value: '#EF4444', $description: 'Error (red-500)' },
      info: { $value: '#3B82F6', $description: 'Info (blue-500)' },
    },
  },

  spacing: {
    $type: 'dimension',
    $description: 'Spacing scale (4px base unit)',
    '0': { $value: '0px' },
    '1': { $value: '4px' },
    '2': { $value: '8px' },
    '3': { $value: '12px' },
    '4': { $value: '16px' },
    '5': { $value: '20px' },
    '6': { $value: '24px' },
    '8': { $value: '32px' },
    '10': { $value: '40px' },
    '12': { $value: '48px' },
    '16': { $value: '64px' },
    '20': { $value: '80px' },
    '24': { $value: '96px' },
  },

  typography: {
    $description: 'Typography tokens',
    family: {
      $type: 'fontFamily',
      sans: { $value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
      mono: { $value: 'ui-monospace, SFMono-Regular, Consolas, monospace' },
      serif: { $value: 'Georgia, Cambria, "Times New Roman", serif' },
    },
    size: {
      $type: 'dimension',
      xs: { $value: '0.75rem', $description: '12px' },
      sm: { $value: '0.875rem', $description: '14px' },
      base: { $value: '1rem', $description: '16px' },
      lg: { $value: '1.125rem', $description: '18px' },
      xl: { $value: '1.25rem', $description: '20px' },
      '2xl': { $value: '1.5rem', $description: '24px' },
      '3xl': { $value: '1.875rem', $description: '30px' },
      '4xl': { $value: '2.25rem', $description: '36px' },
    },
    weight: {
      $type: 'fontWeight',
      thin: { $value: 100 },
      light: { $value: 300 },
      regular: { $value: 400 },
      medium: { $value: 500 },
      semibold: { $value: 600 },
      bold: { $value: 700 },
      extrabold: { $value: 800 },
    },
    lineHeight: {
      $type: 'lineHeight',
      none: { $value: 1 },
      tight: { $value: 1.25 },
      snug: { $value: 1.375 },
      normal: { $value: 1.5 },
      relaxed: { $value: 1.625 },
      loose: { $value: 2 },
    },
  },

  border: {
    $description: 'Border tokens',
    radius: {
      $type: 'dimension',
      none: { $value: '0px' },
      sm: { $value: '2px' },
      base: { $value: '4px' },
      md: { $value: '6px' },
      lg: { $value: '8px' },
      xl: { $value: '12px' },
      '2xl': { $value: '16px' },
      '3xl': { $value: '24px' },
      full: { $value: '9999px' },
    },
    width: {
      $type: 'dimension',
      none: { $value: '0px' },
      thin: { $value: '1px' },
      base: { $value: '2px' },
      thick: { $value: '4px' },
    },
  },

  shadow: {
    $type: 'shadow',
    $description: 'Box shadow tokens',
    none: { $value: 'none' },
    sm: { $value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
    base: { $value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
    md: { $value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
    lg: { $value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
    xl: { $value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
    inner: { $value: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' },
  },

  duration: {
    $type: 'duration',
    $description: 'Animation duration tokens',
    instant: { $value: '0ms' },
    fast: { $value: '100ms' },
    normal: { $value: '200ms' },
    slow: { $value: '300ms' },
    slower: { $value: '500ms' },
  },
} satisfies TokenGroup;
