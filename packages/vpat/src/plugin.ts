/**
 * @module plugin
 * @description AndsPlugin registration for @ands/vpat.
 *
 * Registers the `vpat` top-level command and `vpat-coverage` health metric.
 */

import type {
  AndsPlugin,
  TopLevelCommand,
  CliOutput,
  AndsConfig,
  HealthMetric,
  HealthContext,
  MetricResult,
} from '@ands/contracts';
import { generateVpat, vpatToMarkdown, vpatToJson, vpatToHtml } from './generate-vpat.js';
import { generateAcr } from './generate-acr.js';

const vpatCommand: TopLevelCommand = {
  name: 'vpat',
  description: 'Generate VPAT 2.5 WCAG Edition report from a11y test results',
  handler: async (args, rawConfig) => {
    const config = rawConfig as AndsConfig;
    const formatFlag = args.flags['format'];
    const validFormats = new Set(['markdown', 'json', 'html']);

    if (formatFlag !== undefined && typeof formatFlag !== 'string') {
      return {
        outputVersion: '1.0.0',
        command: 'vpat',
        ok: false,
        exitCode: 4,
        summary: '--format requires a value: markdown, json, or html',
        issues: [{
          category: 'schema',
          code: 'INVALID_FORMAT_FLAG',
          message: '--format requires a value (markdown, json, or html)',
          severity: 'error',
          suggestion: 'ands vpat --format json',
        }],
      } satisfies CliOutput;
    }

    const format = (typeof formatFlag === 'string' ? formatFlag : 'markdown');
    if (!validFormats.has(format)) {
      return {
        outputVersion: '1.0.0',
        command: 'vpat',
        ok: false,
        exitCode: 4,
        summary: `Unknown format "${format}"`,
        issues: [{
          category: 'schema',
          code: 'UNKNOWN_FORMAT',
          message: `Unknown format "${format}". Valid formats: markdown, json, html`,
          severity: 'error',
          suggestion: 'ands vpat --format json',
        }],
      } satisfies CliOutput;
    }

    // In a real implementation, we would collect issues from a11y-gate runners.
    // For now, generate from an empty issue set (no issues = full conformance).
    const issues = (args as any).issues ?? [];

    const report = generateVpat(issues, config.vpat);
    const acr = generateAcr(report);

    let output: string;
    switch (format) {
      case 'json':
        output = vpatToJson(report);
        break;
      case 'html':
        output = vpatToHtml(report);
        break;
      default:
        output = vpatToMarkdown(report);
    }

    return {
      outputVersion: '1.0.0',
      command: 'vpat',
      ok: true,
      exitCode: 0,
      summary: `VPAT report generated (${report.criteria.length} criteria, ${format} format)`,
      issues: [],
      data: {
        report,
        acr,
        output,
        format,
      },
    } satisfies CliOutput;
  },
};

const vpatCoverageMetric: HealthMetric = {
  id: 'vpat-coverage',
  name: 'VPAT Coverage',
  description: 'Percentage of WCAG criteria covered by automated testing',
  compute: async (_ctx: HealthContext): Promise<MetricResult> => {
    // Generate a VPAT with no issues to see how many criteria have automated rules
    const report = generateVpat([]);
    const total = report.criteria.length;
    const evaluated = total - report.summary.notEvaluated;
    const value = total > 0 ? Math.round((evaluated / total) * 100) : 0;

    const threshold = 60;
    let status: 'pass' | 'warn' | 'fail';
    if (value >= threshold) {
      status = 'pass';
    } else if (value >= threshold * 0.6) {
      status = 'warn';
    } else {
      status = 'fail';
    }

    return {
      id: 'vpat-coverage',
      value,
      unit: '%',
      threshold,
      status,
      details: `${evaluated}/${total} WCAG criteria have automated test coverage`,
    };
  },
};

export const vpatPlugin: AndsPlugin = {
  name: '@ands/vpat',
  topLevelCommands: [vpatCommand],
  healthMetrics: [vpatCoverageMetric],
};
