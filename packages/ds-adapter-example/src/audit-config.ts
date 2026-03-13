/**
 * @module audit-config
 * @description AcmeDS-specific audit configuration for `ands audit-tokens`.
 *
 * Configures:
 * - Which files to scan (AcmeDS project structure)
 * - Which literals to always allow (AcmeDS-specific exceptions)
 * - What patterns count as "proper" token access in AcmeDS projects
 * - Where to find the token index (adapter-mapped tokens.index.json)
 *
 * **Swapping DS:** Replace these globs and patterns to match your host DS.
 */

import type { AuditConfig } from '@ands/ands-cli';

/**
 * Audit configuration for projects using AcmeDS.
 * Pass this to `runAuditTokens()` or write it to `ands.config.js`.
 */
export const acmeDsAuditConfig: AuditConfig = {
  /**
   * Directories to scan for hardcoded values.
   * Adjust to match your project's source structure.
   */
  scanDirs: ['src', 'components', 'features'],

  /**
   * File types to scan.
   */
  extensions: ['.css', '.ts', '.tsx', '.js', '.jsx', '.scss', '.module.css'],

  /**
   * Values that are always allowed in AcmeDS projects.
   * Includes AcmeDS-specific utility values and common safe literals.
   */
  allowedLiterals: [
    // AcmeDS utilities
    'acme-transparent',
    // CSS built-ins
    'transparent', 'inherit', 'initial', 'unset', 'revert', 'currentColor',
    'none', 'auto', 'normal', 'bold', 'italic',
    // Common zero values
    '0', '0px', '0%',
    // Layout
    '100%', '50%', 'center', 'flex', 'block', 'inline-flex', 'grid',
    // Borders
    'solid', 'dashed', 'dotted',
    // Common line heights
    '1', '1.5',
  ],

  /**
   * Patterns that indicate proper token access in AcmeDS projects.
   * A match means the occurrence is NOT a violation.
   */
  tokenAccessPatterns: [
    /var\(--acme-[a-z0-9-]+\)/,   // AcmeDS CSS variables: var(--acme-color-primary)
    /var\(--[a-z0-9-]+\)/,        // Any CSS variable
    /TOKEN_[A-Z][A-Z0-9_]*/,      // ANDS TypeScript constants
    /acmeTokens\.[a-z]/,          // AcmeDS token object
    /tokens\.[a-z]/,              // ANDS token object
    /theme\.[a-z]/,               // Theme object access
    /colors\.[a-z]/,              // Color object access
    /spacing\[['"]/,              // Spacing array access
  ],

  /**
   * Path to the adapter-generated tokens.index.json.
   * This file is produced by running `buildAdapterTokenIndex()` + writing JSON.
   */
  tokenIndexPath: 'packages/ds-adapter-example/dist/tokens.index.json',
};
