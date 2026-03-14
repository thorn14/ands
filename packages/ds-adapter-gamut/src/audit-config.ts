/**
 * @module audit-config
 * @description AuditConfig for gamut-all projects.
 *
 * Pass this to `runAuditTokens` when using gamut as your token source.
 * gamut uses surface-based CSS variables: var(--bg-brand), var(--fg-primary), etc.
 */

import type { AuditConfig } from '@ands/ands-cli';

export const gamutAuditConfig: AuditConfig = {
  scanDirs: ['src', 'components', 'features'],
  extensions: ['.css', '.ts', '.tsx', '.js', '.jsx', '.scss'],
  allowedLiterals: [
    'transparent',
    'inherit',
    'initial',
    'unset',
    'revert',
    'currentColor',
    'currentcolor',
    'none',
    '0',
    '0px',
    '100%',
    'auto',
  ],
  tokenAccessPatterns: [
    /var\(--bg-[a-z0-9-]+\)/,      // var(--bg-brand), var(--bg-surface)
    /var\(--fg-[a-z0-9-]+\)/,      // var(--fg-primary), var(--fg-error)
    /var\(--border-[a-z0-9-]+\)/,  // var(--border-subtle)
    /var\(--spacing-[a-z0-9-]+\)/, // var(--spacing-4)
    /gamutTokens\.[a-z]/,           // JS object access
    /TOKEN_[A-Z][A-Z0-9_]*/,       // TS constant
  ],
};
