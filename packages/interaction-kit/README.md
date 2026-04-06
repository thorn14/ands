# @ands/interaction-kit

A reference library of reusable UX flow patterns expressed as Zod schemas and TypeScript
state machines. The recommended starting point for agents implementing ANDS features.

## Description

Provides a pattern manifest, intent schemas, and pure state machines for common
interaction patterns. Agents write an intent file that satisfies a pattern schema,
validate it with `ands validate`, and receive scaffolded or audited output. Patterns are
portable — not tied to any UI framework or DS adapter.

This package occupies the Interaction Kit (Structural) layer: it may import from
`@ands/contracts` and `@ands/foundation-tokens`, but must not import from Feature Lab
or any specific DS adapter.

## Agent workflow

1. Read `src/manifest.ts` to discover available patterns and their file entrypoints.
2. Read the pattern schema (e.g. `src/editable-form/schema.ts`) to understand intent shape.
3. Write an intent file that satisfies the schema.
4. Run `ands validate <intent-file>`, parse JSON output, fix issues, repeat.

## Available patterns

| Pattern ID | Stability | Description |
|---|---|---|
| `editable-form` | stable | Form that starts in view-only mode, switches to edit mode with validation, submission, error handling, and optional confirmation dialog |

## Key exports

| Export | Purpose |
|---|---|
| `PATTERN_MANIFEST` | Array of all registered patterns with entrypoints |
| `PATTERN_IDS` | Array of valid `intent.kind` strings |
| `findPattern` | Look up a `PatternManifestEntry` by ID |
| `editableFormIntentSchema` | Zod schema used by `ands validate` |
| `EditableFormIntent` | TypeScript type for editable-form intent objects |
| `fieldSchema`, `formLogicSchema`, `formLayoutSchema` | Sub-schemas for intent composition |
| `FIELD_TYPES` | Supported field type values |
| `createInitialState` | Factory for the initial idle state |
| `editableFormReducer` | Pure reducer: `(state, event) => state` |
| `canSubmit`, `isLoading`, `getFieldErrors`, `getFormErrors` | State selector helpers |
| `EditableFormState`, `EditableFormEvent` | Union types for all states and events |
| `editableFormScaffoldFiles` | Scaffold template used by `ands scaffold` |

## Usage example

```ts
import {
  PATTERN_MANIFEST,
  findPattern,
  createInitialState,
  editableFormReducer,
  canSubmit,
  type EditableFormIntent,
  type EditableFormEvent,
} from '@ands/interaction-kit';

// Discover patterns
console.log(PATTERN_MANIFEST.map(p => p.id));
// ['editable-form']

// Look up a pattern to find its schema file
const pattern = findPattern('editable-form');
// pattern.entrypoints[0] => 'packages/interaction-kit/src/editable-form/schema.ts'

// Use the state machine
const intent: EditableFormIntent = { /* ...validated intent... */ };
let state = createInitialState(intent);

const event: EditableFormEvent = { type: 'START_EDIT' };
state = editableFormReducer(state, event);

if (canSubmit(state)) {
  // dispatch submit event
}
```

## CLI integration

```bash
# Validate an intent file
pnpm tsx packages/ands-cli/src/bin.ts validate src/intent.ts

# Scaffold a new editable-form feature
pnpm tsx packages/ands-cli/src/bin.ts scaffold \
  --pattern editable-form \
  --output src/features/profile \
  --name profile
```
