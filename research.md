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

## Extension System

ANDS core is frozen. Third parties extend it by publishing an `AndsPlugin` object and declaring it in `ands.config.ts`. No core modifications required.

### Plugin contract (`packages/contracts/src/plugin.ts`)

```ts
interface AndsPlugin {
  name: string;
  patterns?: PatternRegistration[];  // new intent.kind values + schemas
  commands?: PluginCommand[];        // new `ands run <name>` commands
}
```

### Config file (`ands.config.ts` in project root)

```ts
import { gamutPlugin } from '@ands/ds-adapter-gamut';
export default { adapter: '@mycompany/my-ds', plugins: [gamutPlugin] };
```

### Runtime flow

1. CLI loads `ands.config.ts` via dynamic import at startup
2. `buildRegistry(plugins)` merges core patterns + plugin patterns/commands
3. All commands receive the registry — no hardcoded imports

### Agent-first CLI guarantees

All plugin commands MUST:
- Emit ANDS JSON to stdout (same `output-schema.json` contract as built-ins)
- Return stable exit code (0 = ok, 4 = failure, 6 = transient/retry)

This means agents run `ands run test` instead of `pnpm test` — same loop, any toolchain.

Additional agent-friendly features added:
- `ands schema [command]` — runtime introspection without reading docs
- `--dry-run` on scaffold — preview files before writing
- `--stream` on audit-tokens — NDJSON (one Issue per line, context-window efficient)
- `issues[].suggestion` — concrete next CLI command (not prose)
- TTY detection — human-readable in terminal, JSON when piped
- Exit code 6 — transient errors that are safe to retry

### gamut-all as first plugin (`packages/ds-adapter-gamut/`)

gamut-all is a token production engine (generates WCAG-compliant semantic surface tokens).
It integrates as a plugin — not baked into CLI or foundation packages.

```bash
# Once declared in ands.config.ts:
ands run test src/gamut-tokens.json       # token consistency tests
ands run compliance src/gamut-tokens.json # WCAG AA contrast checks
ands audit-tokens                          # no hardcoded surface values
```

See: `packages/ds-adapter-gamut/src/plugin.ts`, `examples/feature-lab/gamut-form-example/ands.config.ts`

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
| Extension system | ✅ | AndsPlugin interface, ands.config.ts, registry, `ands run` |
| Agent-friendly CLI | ✅ | schema cmd, dry-run, NDJSON, suggestion field, TTY detect |
| gamut-all plugin | ✅ | ds-adapter-gamut with compliance + test commands |
| gamut Feature Lab proof | ✅ | gamut-form-example with ands.config.ts |
