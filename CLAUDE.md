# ANDS — Claude Code Specific Notes

> Read `AGENTS.md` first. This file contains Claude-specific additions ONLY.
> Do not duplicate content from AGENTS.md here.

---

## Model-Specific Workflow

When working in this repo:

1. **Before any code change** — write/update `plan.md` with exact file list + exports.
2. **After every intent file change** — run `ands validate` and parse JSON.
3. **Before committing** — run `ands audit-tokens` to check for violations.

---

## Recommended Read Order (progressive disclosure)

```bash
# Step 1: System context
cat research.md

# Step 2: Pattern discovery
cat packages/interaction-kit/src/manifest.ts

# Step 3: Schema for your pattern
cat packages/interaction-kit/src/editable-form/schema.ts

# Step 4: Core contracts (when you need types)
cat packages/contracts/src/index.ts
```

---

## CLI Usage in This Repo

The CLI is not yet globally installed. Run via:

```bash
# Development (TypeScript, no build required)
pnpm tsx packages/ands-cli/src/bin.ts validate <file>
pnpm tsx packages/ands-cli/src/bin.ts audit-tokens
pnpm tsx packages/ands-cli/src/bin.ts scaffold --pattern editable-form --output <dir> --name <name>

# After building
pnpm build
node packages/ands-cli/dist/bin.js validate <file>
```

---

## Branch Rules

- Develop on: `claude/agent-native-design-system-y80na`
- Never push to `main` or `master`
- All commits should reference `plan.md` changes

---

## TypeScript Import Convention

All intra-package imports use `.js` extensions (NodeNext module resolution):
```ts
import { ok } from './result.js';   // ✓ correct (TypeScript NodeNext)
import { ok } from './result';      // ✗ wrong
import { ok } from './result.ts';   // ✗ wrong
```

Inter-package imports use the package name (no extension):
```ts
import { ok } from '@ands/contracts';  // ✓ correct
```

---

## Key Files to Know

| Task | File to read |
|------|-------------|
| What patterns exist? | `packages/interaction-kit/src/manifest.ts` |
| What does an intent look like? | `packages/interaction-kit/src/editable-form/schema.ts` |
| What does CLI output look like? | `packages/ands-cli/src/output-schema.json` |
| What are the exit codes? | `packages/ands-cli/src/exit-codes.ts` |
| How do tokens work? | `packages/foundation-tokens/src/schema.ts` |
| How are primitives typed? | `packages/foundation-primitives/src/button.ts` |
| Working example feature? | `examples/feature-lab/editable-form-example/src/intent.ts` |
