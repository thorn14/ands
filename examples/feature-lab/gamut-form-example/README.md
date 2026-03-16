# gamut-form-example

A working proof combining the `editable-form` pattern with gamut-all semantic tokens and the ANDS plugin extension system.

**Why it matters:** Demonstrates the full ANDS stack end-to-end: intent schema validation, token compliance checking, and zero hardcoded values in CSS — all verifiable via CLI.

---

## Setup

```bash
cd examples/feature-lab/gamut-form-example
pnpm install
```

---

## Validate Everything

```bash
# 1. Validate token format
pnpm test               # ands run test src/gamut-tokens.json

# 2. Check WCAG AA compliance
pnpm compliance         # ands run compliance src/gamut-tokens.json

# 3. Audit for hardcoded values
pnpm tsx packages/ands-cli/src/bin.ts audit-tokens

# 4. Validate intent schema
pnpm validate           # ands validate ./src/intent.ts
```

All should exit code `0`.

---

## Key Files

| File | Purpose |
|------|---------|
| `ands.config.ts` | Registers the gamut plugin with the CLI |
| `src/gamut-tokens.json` | gamut-all token definitions |
| `src/intent.ts` | Editable form intent using gamut surface tokens |
| `src/styles.css` | CSS using only gamut surface variables (no hardcoded values) |

---

## Plugin Config

```ts
// ands.config.ts
import { gamutPlugin } from '@ands/ds-adapter-gamut';

export default {
  adapter: '@ands/ds-adapter-gamut',
  plugins: [gamutPlugin],
};
```

This is what unlocks `ands run test` and `ands run compliance` in this project.
