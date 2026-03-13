# ANDS Implementation Plan

> Agents: update this file BEFORE implementing changes.
> Humans: this is the living implementation record.

---

## Current Plan: Initial Implementation (All Phases)

### Context
Build the complete ANDS monorepo from scratch following the contract-first,
federated-tiered architecture. The system must be portable (DS-agnostic core)
with an optional preset and a swappable adapter layer.

### Files Added/Changed

#### Phase 0 — Skeleton + Core Contracts
- `package.json` — workspace root with pnpm scripts
- `pnpm-workspace.yaml` — declares packages/* and examples/**
- `tsconfig.base.json` — strict TypeScript config (NodeNext, exactOptionalPropertyTypes)
- `.gitignore`
- `packages/contracts/` — `@ands/contracts`
  - `src/brand.ts` — `Brand<T,K>`, `UserId`, `OrderId`, `FieldId`, etc.
  - `src/result.ts` — `Result<T,E>`, `ok()`, `err()`, `mapOk()`, `andThen()`
  - `src/assert-never.ts` — `assertNever()` for exhaustive switches
  - `src/zod-helpers.ts` — `strictObject()`, `nonEmptyString`, `identifier`
  - `src/index.ts` — barrel export

#### Phase A — Foundation Tokens + Primitive Contracts
- `packages/foundation-tokens/` — `@ands/foundation-tokens`
  - `src/schema.ts` — DTCG Zod schema, `TokenGroup`, `TokenLeaf`, `TokenIndex`
  - `src/tokens.ts` — Reference preset token set (colors, spacing, typography, etc.)
  - `src/validator.ts` — `validateTokenGroup()`, `flattenTokens()`
  - `src/build.ts` — Emits `tokens.css`, `tokens.ts`, `tokens.index.json`
  - `src/index.ts` — barrel export
- `packages/foundation-primitives/` — `@ands/foundation-primitives`
  - `src/button.ts` — `ButtonProps` (discriminated union: children|aria-label|aria-labelledby)
  - `src/input.ts` — `InputProps` (same accessible name strategy)
  - `src/index.ts` — barrel export

#### Phase B — Interaction Kit
- `packages/interaction-kit/` — `@ands/interaction-kit`
  - `src/editable-form/schema.ts` — `editableFormIntentSchema` (Zod + TS)
  - `src/editable-form/state-machine.ts` — State/event union types + `EffectDispatch`
  - `src/editable-form/reducer.ts` — `editableFormReducer` (exhaustive switch)
  - `src/manifest.ts` — `PATTERN_MANIFEST` navigation index
  - `src/index.ts` — barrel export

#### Phase C — ANDS CLI
- `packages/ands-cli/` — `@ands/ands-cli`
  - `src/output-schema.json` — JSON Schema (draft 2020-12) for all CLI output
  - `src/exit-codes.ts` — Stable exit code mapping (0-5)
  - `src/output.ts` — `CliOutput`, `Issue`, `makeOutput()`, `emitOutput()`
  - `src/commands/validate.ts` — `ands validate <file>` implementation
  - `src/commands/audit-tokens.ts` — `ands audit-tokens` implementation
  - `src/commands/scaffold.ts` — `ands scaffold` implementation + templates
  - `src/cli.ts` — Main dispatcher
  - `src/bin.ts` — Entry point (shebang)
  - `src/index.ts` — Programmatic API exports

#### Adapter + Feature Lab
- `packages/ds-adapter-example/` — `@ands/ds-adapter-example`
  - `src/token-map.ts` — AcmeDS → ANDS token path mapping
  - `src/components/button.ts` — AcmeDS Button satisfying `ButtonContract`
  - `src/components/input.ts` — AcmeDS TextField satisfying `InputContract`
  - `src/audit-config.ts` — AcmeDS-specific `AuditConfig`
  - `src/scaffold-templates/editable-form.ts` — Adapter renderer
  - `src/index.ts` — barrel export
- `examples/feature-lab/editable-form-example/` — `@ands/editable-form-example`
  - `src/intent.ts` — User Profile form intent (portability proof)
  - `src/reducer.ts` — Feature reducer (delegates to core)
  - `src/index.ts` — barrel export

#### Phase D — Governance Docs
- `AGENTS.md` — Universal agent workflow + CLI commands + file navigation index
- `CLAUDE.md` — Claude-specific deltas (model-specific notes, import conventions)
- `research.md` — System context, architecture, design decisions, current status
- `plan.md` — This file

---

## Verification Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Build all packages (sequential for dependency order)
pnpm build

# 3. Validate the Feature Lab proof
node packages/ands-cli/dist/bin.js validate examples/feature-lab/editable-form-example/dist/intent.js
# Expected: exitCode 0, ok: true

# 4. Audit tokens (no violations in example)
node packages/ands-cli/dist/bin.js audit-tokens
# Expected: exitCode 0

# 5. Scaffold a new feature
node packages/ands-cli/dist/bin.js scaffold --pattern editable-form --output /tmp/test-feature --name test
node packages/ands-cli/dist/bin.js validate /tmp/test-feature/intent.js
# Expected: exitCode 0

# 6. TypeScript check all packages
pnpm typecheck
```

---

## Architecture Invariants (must hold after any change)

1. `packages/contracts/` imports: only `zod` (no ANDS packages)
2. `packages/foundation-tokens/` imports: `@ands/contracts`, `zod` only
3. `packages/foundation-primitives/` imports: `@ands/contracts` only
4. `packages/interaction-kit/` imports: `@ands/contracts`, `zod` only
5. `packages/ands-cli/` imports: `@ands/contracts`, `@ands/interaction-kit` only
6. `packages/ds-adapter-example/` imports: Foundation + Interaction Kit (not Feature Lab)
7. `examples/feature-lab/**` imports: Interaction Kit + Adapters (not preset directly)
