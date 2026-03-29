/**
 * @module plugin
 * @description AndsPlugin registration for @ands/lint-rules.
 */

import type { AndsPlugin, TopLevelCommand, CliOutput, AndsConfig, AndsAdapter, AndsLintRule, AndsLintContext, AndsIssue } from '@ands/contracts';
import { noRawTokenValue } from './rules/no-raw-token-value.js';
import { noDeprecatedProp } from './rules/no-deprecated-prop.js';
import { propNamingConsistency } from './rules/prop-naming-consistency.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const builtInRules: AndsLintRule[] = [
  noRawTokenValue,
  noDeprecatedProp,
  propNamingConsistency,
];

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
    // Directory not accessible
  }
  return results;
}

async function runLint(config: AndsConfig, allRules: AndsLintRule[]): Promise<CliOutput> {
  const rootDir = process.cwd();
  const contentGlobs = config.content ?? ['./src/**/*.{ts,tsx,js,jsx}'];
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'];

  // Resolve adapters (simplified — only inline adapters for now)
  const adapters: AndsAdapter[] = [];
  for (const adapterEntry of config.adapters ?? []) {
    if (typeof adapterEntry === 'object' && !('exclude' in adapterEntry)) {
      adapters.push(adapterEntry as AndsAdapter);
    }
  }

  // Collect files from content globs (simplified — scan src dirs)
  const filesToLint: string[] = [];
  for (const glob of contentGlobs) {
    // Extract directory from glob pattern
    const dirPart = glob.replace(/\/\*\*.*$/, '').replace(/^\.\//, '');
    const absDir = join(rootDir, dirPart);
    filesToLint.push(...collectFiles(absDir, extensions));
  }

  const allIssues: AndsIssue[] = [];

  for (const filePath of filesToLint) {
    let content: string;
    try {
      content = readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const relPath = relative(rootDir, filePath);
    const ctx: AndsLintContext = {
      config,
      adapters,
      filePath: relPath,
      content,
    };

    for (const rule of allRules) {
      const ruleIssues = rule.create(ctx);
      allIssues.push(...ruleIssues);
    }
  }

  const ok = allIssues.filter(i => i.severity === 'error').length === 0;
  return {
    outputVersion: '1.0.0',
    command: 'lint',
    ok,
    exitCode: ok ? 0 : 4,
    summary: ok
      ? `Lint passed (${filesToLint.length} files, ${allRules.length} rules)`
      : `Lint found ${allIssues.length} issue(s) in ${filesToLint.length} files`,
    issues: allIssues,
    data: {
      filesScanned: filesToLint.length,
      rulesApplied: allRules.length,
      errors: allIssues.filter(i => i.severity === 'error').length,
      warnings: allIssues.filter(i => i.severity === 'warn').length,
    },
  };
}

const lintCommand: TopLevelCommand = {
  name: 'lint',
  description: 'Run ESLint + stylelint with ANDS governance rules',
  handler: async (_args, rawConfig) => {
    const config = rawConfig as AndsConfig;
    // Collect all lint rules: built-in + from all plugins
    const allRules = [...builtInRules];
    for (const plugin of config.plugins ?? []) {
      if ('lintRules' in plugin && Array.isArray((plugin as AndsPlugin).lintRules)) {
        allRules.push(...(plugin as AndsPlugin).lintRules!);
      }
    }
    return runLint(config, allRules);
  },
};

export const lintPlugin: AndsPlugin = {
  name: '@ands/lint-rules',
  topLevelCommands: [lintCommand],
  lintRules: builtInRules,
};
