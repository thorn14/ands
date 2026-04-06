/**
 * @module plugin
 * @description AndsPlugin registration for @ands/health.
 *
 * Registers the `audit` top-level command with built-in health metrics:
 * token-coverage, a11y-rate, doc-freshness.
 * Returns a HealthReport wrapped in CliOutput.
 */

import type {
  AndsPlugin,
  TopLevelCommand,
  CliOutput,
  HealthMetric,
  HealthContext,
  HealthReport,
  MetricResult,
} from '@ands/contracts';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// ---------------------------------------------------------------------------
// File collection utility
// ---------------------------------------------------------------------------

function collectFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...collectFiles(fullPath, extensions));
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  } catch {
    // Directory not accessible
  }
  return results;
}

// ---------------------------------------------------------------------------
// Built-in metrics
// ---------------------------------------------------------------------------

/**
 * Token coverage: percentage of source files that import from a token package.
 */
const tokenCoverage: HealthMetric = {
  id: 'token-coverage',
  name: 'Token Coverage',
  description: 'Percentage of source files importing design tokens',
  compute: async (ctx: HealthContext): Promise<MetricResult> => {
    const srcDir = join(ctx.rootDir, 'src');
    const files = collectFiles(srcDir, ['.ts', '.tsx']);
    if (files.length === 0) {
      return {
        id: 'token-coverage',
        value: 100,
        unit: '%',
        status: 'pass',
        ...(undefined === undefined ? {} : {}),
        details: 'No source files found',
      };
    }

    let tokenImports = 0;
    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf8');
        if (/(?:foundation-tokens|@ands\/foundation-tokens|tokens)/.test(content)) {
          tokenImports++;
        }
      } catch {
        // Skip unreadable files
      }
    }

    const value = Math.round((tokenImports / files.length) * 100);
    const threshold = 80;
    let status: 'pass' | 'warn' | 'fail';
    if (value >= threshold) {
      status = 'pass';
    } else if (value >= threshold * 0.6) {
      status = 'warn';
    } else {
      status = 'fail';
    }

    const result: MetricResult = {
      id: 'token-coverage',
      value,
      unit: '%',
      threshold,
      status,
      details: `${tokenImports}/${files.length} files import tokens`,
    };
    return result;
  },
};

/**
 * A11y rate: percentage of component files that have a11y annotations/tests.
 */
const a11yRate: HealthMetric = {
  id: 'a11y-rate',
  name: 'Accessibility Rate',
  description: 'Percentage of component files with accessibility annotations',
  compute: async (ctx: HealthContext): Promise<MetricResult> => {
    const srcDir = join(ctx.rootDir, 'src');
    const files = collectFiles(srcDir, ['.ts', '.tsx']);
    if (files.length === 0) {
      return {
        id: 'a11y-rate',
        value: 100,
        unit: '%',
        status: 'pass',
        details: 'No source files found',
      };
    }

    let a11yCount = 0;
    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf8');
        if (/(?:aria-|role=|a11y|accessibility|@a11y)/.test(content)) {
          a11yCount++;
        }
      } catch {
        // Skip unreadable files
      }
    }

    const value = Math.round((a11yCount / files.length) * 100);
    const threshold = 70;
    let status: 'pass' | 'warn' | 'fail';
    if (value >= threshold) {
      status = 'pass';
    } else if (value >= threshold * 0.6) {
      status = 'warn';
    } else {
      status = 'fail';
    }

    const result: MetricResult = {
      id: 'a11y-rate',
      value,
      unit: '%',
      threshold,
      status,
      details: `${a11yCount}/${files.length} files have a11y annotations`,
    };
    return result;
  },
};

/**
 * Doc freshness: percentage of docs that are newer than their source files.
 */
const docFreshness: HealthMetric = {
  id: 'doc-freshness',
  name: 'Documentation Freshness',
  description: 'Percentage of documentation files that are up to date with source',
  compute: async (ctx: HealthContext): Promise<MetricResult> => {
    const docsDir = join(ctx.rootDir, 'docs');
    const srcDir = join(ctx.rootDir, 'src');

    if (!existsSync(docsDir) || !existsSync(srcDir)) {
      return {
        id: 'doc-freshness',
        value: 100,
        unit: '%',
        status: 'pass',
        details: 'No docs/ or src/ directory found',
      };
    }

    const sourceFiles = collectFiles(srcDir, ['.ts', '.tsx']);
    let matched = 0;
    let fresh = 0;

    for (const srcFile of sourceFiles) {
      const relPath = relative(srcDir, srcFile);
      const docName = relPath.replace(/\.tsx?$/, '.md');
      const docPath = join(docsDir, docName);

      if (!existsSync(docPath)) continue;
      matched++;

      const srcStat = statSync(srcFile);
      const docStat = statSync(docPath);
      if (docStat.mtimeMs >= srcStat.mtimeMs) {
        fresh++;
      }
    }

    if (matched === 0) {
      return {
        id: 'doc-freshness',
        value: 100,
        unit: '%',
        status: 'pass',
        details: 'No matching doc files found',
      };
    }

    const value = Math.round((fresh / matched) * 100);
    const threshold = 90;
    let status: 'pass' | 'warn' | 'fail';
    if (value >= threshold) {
      status = 'pass';
    } else if (value >= threshold * 0.6) {
      status = 'warn';
    } else {
      status = 'fail';
    }

    const result: MetricResult = {
      id: 'doc-freshness',
      value,
      unit: '%',
      threshold,
      status,
      details: `${fresh}/${matched} doc files are up to date`,
    };
    return result;
  },
};

// ---------------------------------------------------------------------------
// Built-in metrics array
// ---------------------------------------------------------------------------

/**
 * PII exposure rate: percentage of source files that contain potential PII patterns.
 * Lower is better — 0% means no PII detected.
 */
const piiExposureRate: HealthMetric = {
  id: 'pii-exposure-rate',
  name: 'PII Exposure Rate',
  description: 'Percentage of source files containing potential PII patterns',
  compute: async (ctx: HealthContext): Promise<MetricResult> => {
    const srcDir = join(ctx.rootDir, 'src');
    const files = collectFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
    if (files.length === 0) {
      return {
        id: 'pii-exposure-rate',
        value: 0,
        unit: '%',
        status: 'pass',
        details: 'No source files found',
      };
    }

    const PII_PATTERNS = [
      /\b\d{3}-\d{2}-\d{4}\b/,                                    // SSN
      /\b(?:4\d{12}(?:\d{3})?|5[1-5]\d{14}|3[47]\d{13})\b/,     // Credit card
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,          // Email
    ];

    let piiCount = 0;
    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf8');
        if (PII_PATTERNS.some(p => p.test(content))) {
          piiCount++;
        }
      } catch {
        // Skip unreadable files
      }
    }

    const value = Math.round((piiCount / files.length) * 100);
    // For PII, lower is better — threshold is a max percentage
    const threshold = 5;
    let status: 'pass' | 'warn' | 'fail';
    if (value <= threshold) {
      status = 'pass';
    } else if (value <= threshold * 3) {
      status = 'warn';
    } else {
      status = 'fail';
    }

    const result: MetricResult = {
      id: 'pii-exposure-rate',
      value,
      unit: '%',
      threshold,
      status,
      details: `${piiCount}/${files.length} files contain potential PII patterns`,
    };
    return result;
  },
};

const builtInMetrics: HealthMetric[] = [tokenCoverage, a11yRate, docFreshness, piiExposureRate];

// ---------------------------------------------------------------------------
// Report builder
// ---------------------------------------------------------------------------

function computeOverall(metrics: MetricResult[]): 'pass' | 'warn' | 'fail' {
  if (metrics.some((m) => m.status === 'fail')) return 'fail';
  if (metrics.some((m) => m.status === 'warn')) return 'warn';
  return 'pass';
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

const auditCommand: TopLevelCommand = {
  name: 'audit',
  description: 'Run design-system health audit: token-coverage, a11y-rate, doc-freshness',
  handler: async (_args, _config) => {
    const rootDir = process.cwd();
    const ctx: HealthContext = { config: _config, rootDir };

    const results: MetricResult[] = [];
    for (const metric of builtInMetrics) {
      const result = await metric.compute(ctx);
      results.push(result);
    }

    const overall = computeOverall(results);
    const report: HealthReport = {
      timestamp: new Date().toISOString(),
      metrics: results,
      overall,
    };

    const ok = overall !== 'fail';
    return {
      outputVersion: '1.0.0',
      command: 'audit',
      ok,
      exitCode: ok ? 0 : 4,
      summary: `Health audit: ${overall} (${results.length} metrics)`,
      issues: results
        .filter((r) => r.status !== 'pass')
        .map((r) => ({
          category: 'compliance' as const,
          code: `HEALTH_${r.id.toUpperCase().replace(/-/g, '_')}`,
          message: `${r.id}: ${r.value}${r.unit} (${r.status})`,
          severity: (r.status === 'fail' ? 'error' : 'warn') as 'error' | 'warn',
          ...(r.details ? { hint: r.details } : {}),
        })),
      data: { report },
    } satisfies CliOutput;
  },
};

export const healthPlugin = {
  name: '@ands/health',
  topLevelCommands: [auditCommand],
  healthMetrics: builtInMetrics,
} satisfies AndsPlugin;
