/**
 * @module plugin
 * @description AndsPlugin registration for @ands/doc-gen.
 *
 * Registers the `docs` top-level command with stale-doc detection.
 * Compares source file modification times against corresponding doc files.
 */

import type {
  AndsPlugin,
  TopLevelCommand,
  CliOutput,
  DocSource,
  DocSourceOutput,
  AndsIssue,
} from '@ands/contracts';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, basename, extname } from 'path';

/** Default doc source: extracts from TypeScript files. */
const tsDocSource: DocSource = {
  name: 'typescript',
  glob: '**/*.ts',
  extract: (filePath: string, content: string): DocSourceOutput => {
    const name = basename(filePath, extname(filePath));
    const title = name.charAt(0).toUpperCase() + name.slice(1);

    const lines = content.split('\n');
    let description: string | undefined;
    const examples: string[] = [];

    for (const line of lines) {
      const descMatch = /^\s*\*\s*@description\s+(.+)/.exec(line);
      if (descMatch?.[1]) {
        description = descMatch[1];
      }
      const exampleMatch = /^\s*\*\s*@example\s*$/.exec(line);
      if (exampleMatch) {
        examples.push('(see source)');
      }
    }

    const result: DocSourceOutput = { title };
    if (description) {
      result.description = description;
    }
    if (examples.length > 0) {
      result.examples = examples;
    }
    return result;
  },
};

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

interface StaleEntry {
  source: string;
  doc: string;
  sourceMtime: number;
  docMtime: number;
}

function detectStaleDocs(rootDir: string): { stale: StaleEntry[]; scanned: number } {
  const docsDir = join(rootDir, 'docs');
  const srcDir = join(rootDir, 'src');

  if (!existsSync(docsDir) || !existsSync(srcDir)) {
    return { stale: [], scanned: 0 };
  }

  const sourceFiles = collectFiles(srcDir, ['.ts', '.tsx']);
  const stale: StaleEntry[] = [];

  for (const srcFile of sourceFiles) {
    const relPath = relative(srcDir, srcFile);
    const docName = relPath.replace(/\.tsx?$/, '.md');
    const docPath = join(docsDir, docName);

    if (!existsSync(docPath)) continue;

    const srcStat = statSync(srcFile);
    const docStat = statSync(docPath);

    if (srcStat.mtimeMs > docStat.mtimeMs) {
      stale.push({
        source: relative(rootDir, srcFile),
        doc: relative(rootDir, docPath),
        sourceMtime: srcStat.mtimeMs,
        docMtime: docStat.mtimeMs,
      });
    }
  }

  return { stale, scanned: sourceFiles.length };
}

function handleGenerate(rootDir: string, sources: DocSource[]): CliOutput {
  const srcDir = join(rootDir, 'src');
  const sourceFiles = collectFiles(srcDir, ['.ts', '.tsx']);
  const extracted: Array<{ file: string; output: DocSourceOutput }> = [];

  for (const filePath of sourceFiles) {
    let content: string;
    try {
      content = readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const relPath = relative(rootDir, filePath);
    for (const source of sources) {
      const output = source.extract(filePath, content);
      extracted.push({ file: relPath, output });
    }
  }

  return {
    outputVersion: '1.0.0',
    command: 'docs generate',
    ok: true,
    exitCode: 0,
    summary: `Extracted documentation from ${extracted.length} file(s)`,
    issues: [],
    data: { entries: extracted },
  } satisfies CliOutput;
}

function handleStale(rootDir: string): CliOutput {
  const { stale, scanned } = detectStaleDocs(rootDir);
  const issues: AndsIssue[] = stale.map((entry) => ({
    category: 'compliance' as const,
    code: 'STALE_DOC',
    message: `Documentation '${entry.doc}' is older than source '${entry.source}'`,
    severity: 'warn' as const,
    hint: `Update ${entry.doc} to reflect changes in ${entry.source}`,
  }));

  const ok = stale.length === 0;
  return {
    outputVersion: '1.0.0',
    command: 'docs stale',
    ok,
    exitCode: ok ? 0 : 4,
    summary: ok
      ? `All docs up to date (${scanned} source files scanned)`
      : `${stale.length} stale doc(s) detected`,
    issues,
    data: { scanned, staleCount: stale.length, stale },
  } satisfies CliOutput;
}

const docsCommand: TopLevelCommand = {
  name: 'docs',
  description: 'Generate documentation and detect stale docs',
  handler: async (args, _config) => {
    const rootDir = process.cwd();
    const subcommand = args.raw[0];
    const sources: DocSource[] = [tsDocSource];

    switch (subcommand) {
      case 'generate':
        return handleGenerate(rootDir, sources);

      case 'stale':
        return handleStale(rootDir);

      default:
        return {
          outputVersion: '1.0.0',
          command: 'docs',
          ok: false,
          exitCode: 4,
          summary: `Unknown subcommand '${subcommand ?? ''}'`,
          issues: [
            {
              category: 'internal',
              code: 'UNKNOWN_SUBCOMMAND',
              message: 'Available subcommands: generate, stale',
              severity: 'error',
              suggestion: 'ands docs stale',
            },
          ],
        } satisfies CliOutput;
    }
  },
};

export const docGenPlugin = {
  name: '@ands/doc-gen',
  topLevelCommands: [docsCommand],
  docSources: [tsDocSource],
} satisfies AndsPlugin;
