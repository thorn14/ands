/**
 * @module audit
 * @description AuditConfig interface — provided by DS adapters to customize `ands audit-tokens`.
 *
 * Defined in `@ands/contracts` so external adapters (published separately from this monorepo)
 * can import the type without depending on `@ands/ands-cli`.
 */

/**
 * Configuration for the `ands audit-tokens` command.
 *
 * DS adapters export a populated `AuditConfig` object that is passed to the CLI
 * (via `ands.config.ts`) to tell the auditor which files to scan, which values
 * are allowed, and where to find the token index.
 *
 * @example
 * // In your adapter package:
 * import type { AuditConfig } from '@ands/contracts';
 * export const myDsAuditConfig: AuditConfig = {
 *   scanDirs: ['src', 'components'],
 *   tokenIndexPath: 'dist/tokens.index.json',
 * };
 */
export interface AuditConfig {
  /**
   * Root directory for scanning. Defaults to `process.cwd()`.
   */
  rootDir?: string;
  /**
   * Stream issues as NDJSON (one JSON line per violation) instead of buffering
   * all violations into a single output object. Triggered by `--stream` flag.
   * @default false
   */
  stream?: boolean;
  /**
   * Subdirectory glob patterns relative to rootDir.
   * @default ['src']
   */
  scanDirs?: string[];
  /**
   * File extensions to scan.
   * @default ['.css', '.ts', '.tsx', '.js', '.jsx', '.scss']
   */
  extensions?: string[];
  /**
   * Literal values that are always allowed (not violations).
   * E.g. 'transparent', 'inherit', 'currentColor', 'none', '0'
   */
  allowedLiterals?: string[];
  /**
   * Regex patterns matching "proper" token access (not violations).
   * E.g. `/var\(--[a-z0-9-]+\)/` for CSS variables.
   */
  tokenAccessPatterns?: RegExp[];
  /**
   * Path to the tokens.index.json file.
   * @default 'packages/foundation-tokens/dist/tokens.index.json'
   */
  tokenIndexPath?: string;
}
