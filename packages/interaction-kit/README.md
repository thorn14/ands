# @ands/interaction-kit

Reusable UX patterns as Zod schemas, state machines, and reducers. This is the primary agent entry point for understanding what features ANDS can build.

**Why it matters:** Agents discover available patterns from `manifest.ts`, read the schema for the pattern they need, and write an `intent.ts` that satisfies it. No prose docs required — the schemas and JSDoc are the contract.

---

## Discovering Patterns

```ts
import { PATTERN_MANIFEST } from '@ands/interaction-kit';

// Each entry has: id, description, entrypoints[], cliKind, stability
PATTERN_MANIFEST.forEach(p => console.log(p.id, p.description));
```

Or via CLI:
```bash
ands schema
```

---

## Current Patterns

### `editable-form` (stable)

An inline-editable form pattern. User views data in read mode, clicks edit, modifies fields, saves or cancels.

**Files:**
- `src/editable-form/schema.ts` — the intent shape (fields, logic, layout)
- `src/editable-form/state-machine.ts` — state and event union types
- `src/editable-form/reducer.ts` — pure state transitions

**Writing an intent:**

```ts
import type { EditableFormIntent } from '@ands/interaction-kit';

export const intent: EditableFormIntent = {
  kind: 'editable-form',
  id: 'user-profile-form',
  fields: [
    { id: 'full-name', label: 'Full Name', type: 'text', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true },
    { id: 'role', label: 'Role', type: 'select', options: [
      { value: 'admin', label: 'Admin' },
      { value: 'viewer', label: 'Viewer' },
    ]},
  ],
  logic: {
    onSuccess: 'toast',
    successMessage: 'Profile updated.',
    onValidationError: 'scroll-to-field',
    onSubmitError: 'banner',
  },
};
```

**Validate:**
```bash
ands validate ./src/intent.ts
```

**State machine:**
```
idle → editing → validating → submitting → success
                                         ↘ error → editing
```

---

## Scaffolding

Generate boilerplate for a new feature:

```bash
ands scaffold --pattern editable-form --output ./src/my-form --name my-form
```

---

## Install

```bash
pnpm add @ands/interaction-kit
```
