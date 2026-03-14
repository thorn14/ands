/**
 * @module commands/audit-tokens
 * @description `ands audit-tokens` — identifies off-system hardcoded CSS/TS values.
 *
 * **Algorithm:**
 * 1. Load `tokens.index.json` (flat path → value map)
 * 2. Glob source files matching the configured patterns
 * 3. For each file, extract all candidate literal values (colors, dimensions, etc.)
 * 4. Report values that appear in the token index but are used as raw literals
 *    instead of via CSS variables (`var(--...)`) or token constants
 *
 * **Adapter hooks:** Callers can provide an `AuditConfig` to customize:
 * - Which files to scan
 * - Which literal values are explicitly allowed (allowlist)
 * - What patterns constitute "proper" token access
 *
 * **Output:** JSON to stdout only.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { ExitCode } from '../exit-codes.js';
import { makeOutput, emitOutput, emitIssueNdjson } from '../output.js';
import type { Issue, IssueLoc } from '../output.js';

// ---------------------------------------------------------------------------
// Audit configuration (adapter-injectable)
// ---------------------------------------------------------------------------

/**
 * Configuration for the audit-tokens command.
 * DS adapters provide this to customize file scanning.
 */
export interface AuditConfig {
  /**
   * Root directory for scanning. Defaults to `process.cwd()`.
   */
  rootDir?: string;
  /**
   * Stream issues as NDJSON (one JSON line per violation) instead of buffering
   * all violations into a single output object. Triggered by `--stream` flag.
   * Keeps agent context window usage proportional to violations found, not files scanned.
   * @default false
   */
  stream?: boolean;
  /**
   * Subdirectory glob patterns relative to rootDir.
   * Defaults to ['src'].
   */
  scanDirs?: string[];
  /**
   * File extensions to scan.
   * @default ['.css', '.ts', '.tsx', '.js', '.jsx', '.scss']
   */
  extensions?: string[];
  /**
   * Literal values that are always allowed (not violations).
   * Typical examples: 'transparent', 'inherit', 'currentColor', 'none', '0', '0px'
   */
  allowedLiterals?: string[];
  /**
   * Regex patterns matching "proper" token access (these are NOT violations).
   * E.g. `var(--color-brand-primary)` in CSS.
   * @default [/var\(--[a-z0-9-]+\)/, /TOKEN_[A-Z0-9_]+/]
   */
  tokenAccessPatterns?: RegExp[];
  /**
   * Path to the tokens.index.json file.
   * @default 'packages/foundation-tokens/dist/tokens.index.json'
   */
  tokenIndexPath?: string;
}

const DEFAULT_ALLOWED_LITERALS = new Set([
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
  '0%',
  '100%',
  '50%',
  'auto',
  'normal',
  'bold',
  'italic',
  'center',
  'left',
  'right',
  'top',
  'bottom',
  'flex',
  'block',
  'inline',
  'hidden',
  'visible',
  'pointer',
  'default',
]);

const DEFAULT_TOKEN_ACCESS_PATTERNS = [
  /var\(--[a-z0-9-]+\)/,         // CSS custom property usage
  /TOKEN_[A-Z][A-Z0-9_]*/,       // TypeScript constant
  /tokens\.[a-z]/,               // token object property access
  /--[a-z0-9-]+/,                // raw CSS variable reference
];

// ---------------------------------------------------------------------------
// Value extraction regexes
// ---------------------------------------------------------------------------

// Hex colors: #RGB, #RRGGBB, #RRGGBBAA
const HEX_COLOR_RE = /#[0-9A-Fa-f]{3,8}\b/g;
// RGB/RGBA colors
const RGB_RE = /\brgb[a]?\([^)]+\)/g;
// HSL/HSLA colors
const HSL_RE = /\bhsl[a]?\([^)]+\)/g;
// CSS dimensions
const DIMENSION_RE = /\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw|pt|cm|mm|%)\b/g;

function extractLiterals(content: string): Array<{ value: string; index: number }> {
  const results: Array<{ value: string; index: number }> = [];
  for (const re of [HEX_COLOR_RE, RGB_RE, HSL_RE, DIMENSION_RE]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(content)) !== null) {
      results.push({ value: match[0], index: match.index });
    }
  }
  return results;
}

function getLineCol(content: string, index: number): { line: number; col: number } {
  const before = content.slice(0, index);
  const lines = before.split('\n');
  return {
    line: lines.length,
    col: (lines[lines.length - 1]?.length ?? 0),
  };
}

// ---------------------------------------------------------------------------
// File scanning
// ---------------------------------------------------------------------------

function collectFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...collectFiles(fullPath, extensions));
      } else if (extensions.some(ext => entry.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  } catch {
    // Directory not accessible — skip
  }
  return results;
}

// ---------------------------------------------------------------------------
// Command implementation
// ---------------------------------------------------------------------------

export async function runAuditTokens(config: AuditConfig = {}): Promise<number> {
  const rootDir = config.rootDir ?? process.cwd();
  const scanDirs = config.scanDirs ?? ['src'];
  const extensions = config.extensions ?? ['.css', '.ts', '.tsx', '.js', '.jsx', '.scss'];
  const streamMode = config.stream ?? false;
  const allowedLiterals = new Set([
    ...DEFAULT_ALLOWED_LITERALS,
    ...(config.allowedLiterals ?? []),
  ]);
  const tokenAccessPatterns = config.tokenAccessPatterns ?? DEFAULT_TOKEN_ACCESS_PATTERNS;
  const tokenIndexPath =
    config.tokenIndexPath ??
    join(rootDir, 'packages/foundation-tokens/dist/tokens.index.json');

  // Load token index
  let tokenIndex: Record<string, string | number>;
  try {
    const raw = readFileSync(tokenIndexPath, 'utf8');
    tokenIndex = JSON.parse(raw) as Record<string, string | number>;
  } catch (e) {
    return emitOutput(
      makeOutput(
        'audit-tokens',
        false,
        ExitCode.ModuleLoadFailure,
        `Could not load tokens.index.json: ${String(e instanceof Error ? e.message : e)}`,
        [
          {
            category: 'load',
            code: 'TOKEN_INDEX_MISSING',
            message: `Could not read token index at: ${tokenIndexPath}`,
            hint: 'Run `pnpm build:tokens` in packages/foundation-tokens first, or provide --token-index <path>.',
          },
        ],
      ),
    );
  }

  // Build set of token values for O(1) lookup
  const tokenValues = new Set(
    Object.values(tokenIndex).map(v => String(v).toLowerCase()),
  );

  // Collect all files to scan
  const filesToScan: string[] = [];
  for (const dir of scanDirs) {
    const absDir = join(rootDir, dir);
    filesToScan.push(...collectFiles(absDir, extensions));
  }

  if (filesToScan.length === 0) {
    return emitOutput(
      makeOutput(
        'audit-tokens',
        true,
        ExitCode.Success,
        `No files found to scan in: ${scanDirs.join(', ')}`,
        [],
        { data: { filesScanned: 0, violations: 0 } },
      ),
    );
  }

  // Scan files
  const issues: Issue[] = [];

  let violationCount = 0;
  for (const filePath of filesToScan) {
    let content: string;
    try {
      content = readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const literals = extractLiterals(content);

    for (const { value, index } of literals) {
      const valueLower = value.toLowerCase();

      // Skip allowed literals
      if (allowedLiterals.has(value) || allowedLiterals.has(valueLower)) continue;

      // Skip if this literal itself is a proper token access (e.g. var(--...), TOKEN_...)
      const isProperAccess = tokenAccessPatterns.some(re => re.test(value));
      if (isProperAccess) continue;

      // Check if this value matches a known token value
      if (!tokenValues.has(valueLower)) continue;

      // Find which token paths this value corresponds to
      const matchingPaths = Object.entries(tokenIndex)
        .filter(([, v]) => String(v).toLowerCase() === valueLower)
        .map(([k]) => k);

      const { line, col } = getLineCol(content, index);
      const relPath = relative(rootDir, filePath);

      const issue: Issue = {
        category: 'token',
        code: 'HARDCODED_TOKEN_VALUE',
        message: `Hardcoded value "${value}" should be accessed via token variable`,
        loc: { file: relPath, line, col },
        hint:
          `Use CSS variable: var(--${matchingPaths[0]?.replace(/\./g, '-') ?? ''}) ` +
          `or TS constant: TOKEN_${(matchingPaths[0] ?? '').toUpperCase().replace(/[.\-]/g, '_')}. ` +
          `Matching token path(s): ${matchingPaths.slice(0, 3).join(', ')}`,
      };

      if (streamMode) {
        emitIssueNdjson(issue);
      } else {
        issues.push(issue);
      }
      violationCount++;
    }
  }

  // In stream mode, emit a final summary line and return
  if (streamMode) {
    const ok = violationCount === 0;
    process.stdout.write(
      JSON.stringify({
        type: 'summary',
        ok,
        filesScanned: filesToScan.length,
        violations: violationCount,
      }) + '\n',
    );
    return ok ? ExitCode.Success : ExitCode.ContractRuleFailure;
  }

  const ok = issues.length === 0;
  return emitOutput(
    makeOutput(
      'audit-tokens',
      ok,
      ok ? ExitCode.Success : ExitCode.ContractRuleFailure,
      ok
        ? `No violations found (${filesToScan.length} file(s) scanned)`
        : `Found ${violationCount} hardcoded token value(s) in ${filesToScan.length} file(s)`,
      issues,
      { data: { filesScanned: filesToScan.length, violations: violationCount } },
    ),
  );
}

// ---------------------------------------------------------------------------
// CLI argument parser for audit-tokens flags
// ---------------------------------------------------------------------------

export interface AuditTokensArgs {
  config?: AuditConfig;
  configPath?: string;
}

export function parseAuditArgs(args: string[]): AuditTokensArgs {
  const result: AuditTokensArgs = { config: {} };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--token-index' && args[i + 1]) {
      result.config!.tokenIndexPath = args[i + 1]!;
      i++;
    } else if (args[i] === '--dir' && args[i + 1]) {
      result.config!.scanDirs = args[i + 1]!.split(',');
      i++;
    } else if (args[i] === '--allow' && args[i + 1]) {
      result.config!.allowedLiterals = args[i + 1]!.split(',');
      i++;
    } else if (args[i] === '--stream') {
      result.config!.stream = true;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

export const AUDIT_TOKENS_HELP = `
ands audit-tokens [options]

  Scan source files for hardcoded CSS/TS values that should use token variables.

  Options:
    --token-index <path>  Path to tokens.index.json
                          Default: packages/foundation-tokens/dist/tokens.index.json
    --dir <dirs>          Comma-separated list of directories to scan
                          Default: src
    --allow <values>      Comma-separated additional allowed literals

  Output:    JSON to stdout

  Exit codes:
    0  No violations
    1  Could not load token index (run pnpm build:tokens first)
    4  Violations found

  Example:
    ands audit-tokens
    ands audit-tokens --dir src,components --allow "1px solid"
    ands audit-tokens --token-index ./my-ds/tokens.index.json
`.trim();
