/**
 * @module manifest
 * @description Pattern manifest — the navigation index for agents.
 *
 * **Agent: start here.** Read this manifest to discover available patterns
 * and their entrypoints before reading any implementation files.
 *
 * Each entry lists:
 *  - `id`          — pattern identifier used in intent `kind` field
 *  - `entrypoints` — ordered list of files to read (progressive disclosure)
 *  - `cliKind`     — the value to pass as `intent.kind` for `ands validate`
 *  - `description` — one-line summary
 */

import type { PatternId } from '@ands/contracts';
import { brand } from '@ands/contracts';

// ---------------------------------------------------------------------------
// Manifest entry type
// ---------------------------------------------------------------------------

export interface PatternManifestEntry {
  /** Unique pattern identifier. Used as `intent.kind`. */
  id: PatternId;
  /** One-line description of the pattern. */
  description: string;
  /**
   * Ordered list of source files an agent should read.
   * Read in order for progressive disclosure (start with the schema).
   */
  entrypoints: readonly string[];
  /**
   * The `kind` discriminant value used in intent files and `ands validate`.
   * Must match the `z.literal(...)` in the pattern's intent schema.
   */
  cliKind: string;
  /** Package that owns this pattern. */
  package: string;
  /** Pattern tier/stability. */
  stability: 'stable' | 'beta' | 'experimental';
}

// ---------------------------------------------------------------------------
// Pattern registry
// ---------------------------------------------------------------------------

/**
 * The ANDS interaction pattern manifest.
 *
 * Agents: read `entrypoints[0]` (the schema) first, then proceed in order.
 * Do NOT read all files at once — use progressive disclosure.
 */
export const PATTERN_MANIFEST: readonly PatternManifestEntry[] = [
  {
    id: brand<PatternId>('editable-form'),
    description:
      'A form that starts in view-only mode and can be switched to edit mode. ' +
      'Supports validation, submission, error handling, and confirmation dialogs.',
    entrypoints: [
      'packages/interaction-kit/src/editable-form/schema.ts',       // 1. Read first — intent shape
      'packages/interaction-kit/src/editable-form/state-machine.ts', // 2. State/event types
      'packages/interaction-kit/src/editable-form/reducer.ts',       // 3. Transitions + selectors
    ],
    cliKind: 'editable-form',
    package: '@ands/interaction-kit',
    stability: 'stable',
  },
] as const;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Look up a pattern by its `id`.
 * Returns `undefined` if not found — check before accessing.
 */
export function findPattern(id: string): PatternManifestEntry | undefined {
  return PATTERN_MANIFEST.find(p => p.id === id);
}

/**
 * All registered pattern IDs.
 * Agents: use this to enumerate valid `intent.kind` values.
 */
export const PATTERN_IDS: readonly string[] = PATTERN_MANIFEST.map(p => p.id);
