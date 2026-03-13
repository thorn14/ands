# ANDS Research Notes

> System context for agents. Read before writing plan.md.
> Updated as the system evolves.

---

## System Overview

ANDS is a **portable harness** — a contract layer that wraps an existing design system
to make it agent-consumable. It is NOT a design system itself (that's the optional Preset).

**Primary goal:** Agents can implement complex form features by reading only:
1. The relevant Interaction Schema (Zod + TS types)
2. Running `ands-cli` commands in a loop

**No markdown usage docs required.** Everything is in schemas + JSDoc.

---

## Tiered Architecture

```
Foundation (Rigid)       packages/contracts/, foundation-tokens/, foundation-primitives/
   ↑
Interaction Kit          packages/interaction-kit/
(Structural)
   ↑
Feature Lab              examples/feature-lab/
(Flexible)
   ↑
DS Adapter               packages/ds-adapter-example/
(Per Design System)
```

### Boundary enforcement
- Foundation: zero internal ANDS imports
- Interaction Kit: imports Foundation only
- Feature Lab: imports Interaction Kit + Adapters
- Adapters: imports Foundation + Interaction Kit

---

## Portability Model

| Layer | What lives here | Who uses it |
|-------|----------------|-------------|
| Core | contracts, interaction-kit, ands-cli | Everyone |
| Preset | reference tokens, reference primitives | Greenfield/demo only |
| Adapter | token mapping, component wrappers, audit config | DS-specific projects |

**Swapping DS = swapping the adapter.** Core is unchanged.

---

## Key Design Decisions

### 1. Contract-First
Intent files are validated against Zod schemas, not documentation.
The `ands validate` CLI is the source of truth.

### 2. Branded Types
`UserId`, `FieldId`, `PatternId` etc. are branded with `unique symbol`.
Prevents cross-domain ID confusion at compile time.

### 3. Result Pattern
All tool outputs return `Result<T, E>`. No exceptions for expected failures.
CLI commands translate `Err` into exit codes + JSON issues.

### 4. Exhaustive Reducers
All state machine reducers use `assertNever` in the default branch.
Adding a new event type breaks the build until all reducers are updated.

### 5. Progressive Disclosure
Agents navigate via:
- `manifest.ts` (pattern index)
- Small, focused files (one concept per file)
- JSDoc on all public exports

---

## Package Dependency Graph

```
@ands/contracts              (no deps)
@ands/foundation-tokens      → contracts
@ands/foundation-primitives  → contracts
@ands/interaction-kit        → contracts
@ands/ands-cli               → contracts, interaction-kit
@ands/ds-adapter-example     → contracts, foundation-tokens, foundation-primitives, interaction-kit
@ands/editable-form-example  → contracts, interaction-kit, ds-adapter-example
```

---

## Token System

Tokens follow the DTCG/W3C Design Token Community Group format:
- `$value` on leaves (required)
- `$type` on groups or leaves (optional; group $type is inherited)
- `$description` optional documentation
- Names: lowercase, alphanumeric, hyphens, underscores; no `$`, `.`, `{}` prefixes

Build outputs (from `pnpm build:tokens`):
- `dist/tokens.css` — CSS custom properties (`:root { --color-brand-primary: #3B82F6; }`)
- `dist/tokens.ts` — TypeScript constants (`TOKEN_COLOR_BRAND_PRIMARY`)
- `dist/tokens.index.json` — flat path → value map for audit

---

## CLI Output Format

All commands emit JSON. Agents MUST parse JSON, not prose.

```json
{
  "outputVersion": "1.0.0",
  "command": "validate",
  "file": "./intent.js",
  "ok": false,
  "exitCode": 3,
  "summary": "Schema parse failure: 1 error(s) found",
  "issues": [
    {
      "category": "schema",
      "code": "ZOD_PARSE_FAILURE",
      "message": "Required",
      "path": ["fields", "0", "label"],
      "hint": "Fix the value at path: intent.fields.0.label"
    }
  ]
}
```

Full contract: `packages/ands-cli/src/output-schema.json`

---

## Editable Form Pattern

Pattern ID: `editable-form`
Intent schema: `packages/interaction-kit/src/editable-form/schema.ts`

States: `idle` → `editing` → `validating` → `submitting` → `success` | `error`

Key design: `logic` and `fields` are separate concerns:
- `fields` = what data to collect (serializable, CLI-validatable)
- `logic` = what happens on events (adapter decides HOW to implement outcomes)

This separation means the same intent can be rendered by any adapter.

---

## Current Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 (skeleton) | ✅ | contracts package + workspace |
| Phase A (tokens + primitives) | ✅ | DTCG validator, build outputs, a11y contracts |
| Phase B (interaction-kit) | ✅ | editable-form schema, state machine, reducer, manifest |
| Phase C (ands-cli) | ✅ | validate, audit-tokens, scaffold + JSON output schema |
| Phase D (agent loop files) | ✅ | AGENTS.md, CLAUDE.md, research.md, plan.md |
| Adapter example | ✅ | ds-adapter-example with AcmeDS simulation |
| Feature Lab proof | ✅ | editable-form-example validates via `ands validate` |
