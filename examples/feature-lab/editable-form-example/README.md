# editable-form-example

A working proof of the `editable-form` pattern. Demonstrates a User Profile form that validates cleanly via `ands validate`.

**Why it matters:** This is the canonical reference for what a correct `EditableFormIntent` looks like. If you're writing a new editable-form feature, start here.

---

## What it does

Defines a User Profile form with fields for full name, email, and role. Specifies UX outcomes (toast on success, scroll to field on validation error, banner on submit error).

---

## Validate

```bash
# From repo root (TypeScript, no build)
cd examples/feature-lab/editable-form-example
pnpm validate

# Or directly
pnpm tsx packages/ands-cli/src/bin.ts validate examples/feature-lab/editable-form-example/src/intent.ts
```

Expected output: `"ok": true`, exit code `0`.

---

## Key Files

- `src/intent.ts` — the form intent (fields + logic)
- `src/reducer.ts` — feature-specific state reducer extending the base editable-form reducer

---

## Intent Shape

```ts
export const intent: EditableFormIntent = {
  kind: 'editable-form',
  id: 'user-profile-form',
  fields: [
    { id: 'full-name', label: 'Full Name', type: 'text', required: true },
    { id: 'email',     label: 'Email',     type: 'email', required: true },
    { id: 'role',      label: 'Role',      type: 'select', options: [...] },
  ],
  logic: {
    onSuccess: 'toast',
    successMessage: 'Profile updated.',
    onValidationError: 'scroll-to-field',
    onSubmitError: 'banner',
  },
};
```

See `packages/interaction-kit/src/editable-form/schema.ts` for the full schema.
