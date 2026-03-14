/**
 * @module commands/validate
 * @description `ands validate <file>` — validates an intent module against its schema.
 *
 * **Algorithm:**
 * 1. Load module via dynamic `import()` (works for .js files; .ts requires tsx)
 * 2. Check that module exports a named `intent` object with a `kind` field
 * 3. Look up the Zod schema by `intent.kind` in the runtime registry
 * 4. Run `schema.safeParse(intent)` — collect all Zod errors
 * 5. Emit JSON output, exit with stable code
 *
 * **Registry:** Schemas come from the RuntimeRegistry built at CLI startup,
 * seeded with core patterns + any plugins declared in ands.config.ts.
 *
 * **Output:** Always JSON to stdout when piped. Human-readable when TTY.
 */

import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { ExitCode } from '../exit-codes.js';
import { makeOutput, emitOutput } from '../output.js';
import type { Issue } from '../output.js';
import type { RuntimeRegistry } from '../registry.js';

// ---------------------------------------------------------------------------
// Command implementation
// ---------------------------------------------------------------------------

export async function runValidate(filePath: string, registry: RuntimeRegistry): Promise<number> {
  const absPath = resolve(filePath);

  // Step 1: Load module
  let mod: unknown;
  try {
    const fileUrl = pathToFileURL(absPath).href;
    mod = await import(fileUrl);
  } catch (e) {
    return emitOutput(
      makeOutput(
        'validate',
        false,
        ExitCode.ModuleLoadFailure,
        `Module load failure: ${String(e instanceof Error ? e.message : e)}`,
        [
          {
            category: 'load',
            code: 'MODULE_LOAD_FAILURE',
            message: String(e instanceof Error ? e.message : e),
            hint:
              'Ensure the file exists and is a valid ES module (.js). ' +
              'For TypeScript files, compile first or run the CLI with tsx.',
            suggestion: `ands schema validate`,
          },
        ],
        { file: filePath },
      ),
    );
  }

  // Step 2: Check intent export
  if (
    typeof mod !== 'object' ||
    mod === null ||
    !('intent' in (mod as object))
  ) {
    return emitOutput(
      makeOutput(
        'validate',
        false,
        ExitCode.IntentExportInvalid,
        'Module does not export a named "intent" object',
        [
          {
            category: 'export',
            code: 'INTENT_EXPORT_MISSING',
            message: 'Expected module to export: export const intent = { kind: "...", ... }',
            hint: `Add \`export const intent = { kind: "editable-form", ... }\` to your intent file.`,
            suggestion: `ands scaffold --pattern editable-form --output ./src/my-form --name my-form`,
          },
        ],
        { file: filePath },
      ),
    );
  }

  const intent = (mod as Record<string, unknown>)['intent'];

  if (typeof intent !== 'object' || intent === null) {
    return emitOutput(
      makeOutput(
        'validate',
        false,
        ExitCode.IntentExportInvalid,
        'intent export is not an object',
        [
          {
            category: 'export',
            code: 'INTENT_NOT_OBJECT',
            message: `intent export must be a plain object, got ${typeof intent}`,
            hint: 'The intent export must be a plain object literal.',
          },
        ],
        { file: filePath },
      ),
    );
  }

  if (!('kind' in intent)) {
    return emitOutput(
      makeOutput(
        'validate',
        false,
        ExitCode.IntentExportInvalid,
        'intent.kind is missing',
        [
          {
            category: 'export',
            code: 'INTENT_KIND_MISSING',
            message: 'intent.kind is required to select the correct validation schema',
            path: ['kind'],
            hint: `Add a "kind" field. Valid values: ${registry.supportedKinds.join(', ')}`,
            suggestion: 'ands schema validate',
          },
        ],
        { file: filePath },
      ),
    );
  }

  const kind = (intent as Record<string, unknown>)['kind'];

  if (typeof kind !== 'string') {
    return emitOutput(
      makeOutput(
        'validate',
        false,
        ExitCode.IntentExportInvalid,
        'intent.kind must be a string',
        [
          {
            category: 'export',
            code: 'INTENT_KIND_INVALID_TYPE',
            message: `intent.kind must be a string, got ${typeof kind}`,
            path: ['kind'],
          },
        ],
        { file: filePath },
      ),
    );
  }

  // Step 3: Look up schema in registry
  const schema = registry.schemas[kind];
  if (!schema) {
    return emitOutput(
      makeOutput(
        'validate',
        false,
        ExitCode.SchemaParseFailure,
        `No schema registered for kind "${kind}"`,
        [
          {
            category: 'schema',
            code: 'UNKNOWN_KIND',
            message: `No schema registered for intent.kind "${kind}"`,
            path: ['kind'],
            hint:
              `Valid kinds: ${registry.supportedKinds.join(', ')}. ` +
              `Check packages/interaction-kit/src/manifest.ts for core patterns, or ands.config.ts for plugins.`,
            suggestion: 'ands schema validate',
          },
        ],
        { file: filePath },
      ),
    );
  }

  // Step 4: Zod parse
  const parseResult = schema.safeParse(intent);

  if (!parseResult.success) {
    const issues: Issue[] = parseResult.error.issues.map(issue => ({
      category: 'schema' as const,
      code: 'ZOD_PARSE_FAILURE',
      message: issue.message,
      path: issue.path.map(p => String(p)),
      hint: issue.path.length > 0
        ? `Fix the value at path: intent.${issue.path.join('.')}`
        : 'Fix the top-level intent object structure.',
    }));

    return emitOutput(
      makeOutput(
        'validate',
        false,
        ExitCode.SchemaParseFailure,
        `Schema parse failure: ${issues.length} error(s) found`,
        issues,
        { file: filePath },
      ),
    );
  }

  // Step 5: Success
  return emitOutput(
    makeOutput(
      'validate',
      true,
      ExitCode.Success,
      `Validation passed — intent "${kind}" is valid`,
      [],
      {
        file: filePath,
        data: { kind, id: (parseResult.data as Record<string, unknown>)['id'] },
      },
    ),
  );
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

export const VALIDATE_HELP = `
ands validate <file>

  Validate an intent file against its Interaction Kit schema.

  Arguments:
    <file>   Path to the intent JS/TS module.
             Must export: export const intent = { kind: "...", ... }

  Output:    JSON to stdout when piped; human-readable in TTY (see ANDS_JSON=1)

  Exit codes:
    0  Validation passed
    1  Module could not be loaded
    2  No valid intent export found
    3  Zod schema parse failure
    5  Internal CLI error

  Agent tip: run \`ands schema validate\` to introspect this command's contract.

  Example:
    ands validate ./src/features/user-profile/intent.js
    ands validate ./src/features/user-profile/intent.js | jq .issues
`.trim();
