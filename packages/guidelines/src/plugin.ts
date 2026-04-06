/**
 * @module plugin
 * @description AndsPlugin registration for @ands/guidelines.
 *
 * Registers the `guideline` top-level command with subcommands:
 * list, get <id>, validate, add.
 */

import type {
  AndsPlugin,
  TopLevelCommand,
  CliOutput,
  ParsedArgs,
  GuidelineEntry,
  AndsIssue,
} from '@ands/contracts';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const GUIDELINES_FILENAME = 'ands-guidelines.json';

function getGuidelinesPath(): string {
  return join(process.cwd(), GUIDELINES_FILENAME);
}

function loadGuidelines(): GuidelineEntry[] {
  const filePath = getGuidelinesPath();
  if (!existsSync(filePath)) {
    return [];
  }
  try {
    const raw = readFileSync(filePath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as GuidelineEntry[];
  } catch {
    return [];
  }
}

function saveGuidelines(entries: GuidelineEntry[]): void {
  const filePath = getGuidelinesPath();
  writeFileSync(filePath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
}

function handleList(): CliOutput {
  const entries = loadGuidelines();
  return {
    outputVersion: '1.0.0',
    command: 'guideline list',
    ok: true,
    exitCode: 0,
    summary: `Found ${entries.length} guideline(s)`,
    issues: [],
    data: { guidelines: entries },
  } satisfies CliOutput;
}

function handleGet(id: string): CliOutput {
  const entries = loadGuidelines();
  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    return {
      outputVersion: '1.0.0',
      command: 'guideline get',
      ok: false,
      exitCode: 4,
      summary: `Guideline '${id}' not found`,
      issues: [
        {
          category: 'internal',
          code: 'GUIDELINE_NOT_FOUND',
          message: `No guideline with id '${id}' exists`,
          severity: 'error',
        },
      ],
    } satisfies CliOutput;
  }
  return {
    outputVersion: '1.0.0',
    command: 'guideline get',
    ok: true,
    exitCode: 0,
    summary: `Guideline '${id}': ${entry.title}`,
    issues: [],
    data: { guideline: entry },
  } satisfies CliOutput;
}

function handleValidate(): CliOutput {
  const entries = loadGuidelines();
  const issues: AndsIssue[] = [];

  const seenIds = new Set<string>();
  for (const entry of entries) {
    if (seenIds.has(entry.id)) {
      issues.push({
        category: 'schema',
        code: 'DUPLICATE_GUIDELINE_ID',
        message: `Duplicate guideline id '${entry.id}'`,
        severity: 'error',
      });
    }
    seenIds.add(entry.id);

    if (!entry.title.trim()) {
      issues.push({
        category: 'schema',
        code: 'EMPTY_GUIDELINE_TITLE',
        message: `Guideline '${entry.id}' has an empty title`,
        severity: 'error',
      });
    }

    if (!entry.path.trim()) {
      issues.push({
        category: 'schema',
        code: 'EMPTY_GUIDELINE_PATH',
        message: `Guideline '${entry.id}' has an empty path`,
        severity: 'error',
      });
    }
  }

  const ok = issues.filter((i) => i.severity === 'error').length === 0;
  return {
    outputVersion: '1.0.0',
    command: 'guideline validate',
    ok,
    exitCode: ok ? 0 : 4,
    summary: ok
      ? `All ${entries.length} guideline(s) valid`
      : `Found ${issues.length} validation issue(s)`,
    issues,
  } satisfies CliOutput;
}

function handleAdd(args: ParsedArgs): CliOutput {
  const id = typeof args.flags['id'] === 'string' ? args.flags['id'] : undefined;
  const title = typeof args.flags['title'] === 'string' ? args.flags['title'] : undefined;
  const category = typeof args.flags['category'] === 'string' ? args.flags['category'] : undefined;
  const path = typeof args.flags['path'] === 'string' ? args.flags['path'] : undefined;

  if (!id || !title || !category || !path) {
    return {
      outputVersion: '1.0.0',
      command: 'guideline add',
      ok: false,
      exitCode: 4,
      summary: 'Missing required flags: --id, --title, --category, --path',
      issues: [
        {
          category: 'schema',
          code: 'MISSING_FLAGS',
          message: 'All of --id, --title, --category, --path are required',
          severity: 'error',
          suggestion: 'ands guideline add --id my-rule --title "My Rule" --category a11y --path ./docs/my-rule.md',
        },
      ],
    } satisfies CliOutput;
  }

  const entries = loadGuidelines();
  const existing = entries.find((e) => e.id === id);
  if (existing) {
    return {
      outputVersion: '1.0.0',
      command: 'guideline add',
      ok: false,
      exitCode: 4,
      summary: `Guideline '${id}' already exists`,
      issues: [
        {
          category: 'schema',
          code: 'DUPLICATE_GUIDELINE_ID',
          message: `A guideline with id '${id}' already exists`,
          severity: 'error',
        },
      ],
    } satisfies CliOutput;
  }

  const newEntry: GuidelineEntry = { id, title, category, path };

  const description = typeof args.flags['description'] === 'string' ? args.flags['description'] : undefined;
  if (description) {
    newEntry.description = description;
  }

  const tagsRaw = typeof args.flags['tags'] === 'string' ? args.flags['tags'] : undefined;
  if (tagsRaw) {
    newEntry.tags = tagsRaw.split(',').map((t) => t.trim());
  }

  entries.push(newEntry);
  saveGuidelines(entries);

  return {
    outputVersion: '1.0.0',
    command: 'guideline add',
    ok: true,
    exitCode: 0,
    summary: `Added guideline '${id}'`,
    issues: [],
    data: { guideline: newEntry },
  } satisfies CliOutput;
}

const guidelineCommand: TopLevelCommand = {
  name: 'guideline',
  description: 'Manage ANDS design-system guidelines: list, get, validate, add',
  handler: async (args, _config) => {
    const subcommand = args.raw[0];

    switch (subcommand) {
      case 'list':
        return handleList();

      case 'get': {
        const id = args.raw[1];
        if (!id) {
          return {
            outputVersion: '1.0.0',
            command: 'guideline get',
            ok: false,
            exitCode: 4,
            summary: 'Missing guideline id',
            issues: [
              {
                category: 'schema',
                code: 'MISSING_ID',
                message: 'Usage: ands guideline get <id>',
                severity: 'error',
              },
            ],
          } satisfies CliOutput;
        }
        return handleGet(id);
      }

      case 'validate':
        return handleValidate();

      case 'add':
        return handleAdd(args);

      default:
        return {
          outputVersion: '1.0.0',
          command: 'guideline',
          ok: false,
          exitCode: 4,
          summary: `Unknown subcommand '${subcommand ?? ''}'`,
          issues: [
            {
              category: 'internal',
              code: 'UNKNOWN_SUBCOMMAND',
              message: 'Available subcommands: list, get <id>, validate, add',
              severity: 'error',
              suggestion: 'ands guideline list',
            },
          ],
        } satisfies CliOutput;
    }
  },
};

export const guidelinesPlugin = {
  name: '@ands/guidelines',
  topLevelCommands: [guidelineCommand],
} satisfies AndsPlugin;
