# ANDS — Agent-Native Design System

ANDS is a **portability harness** that wraps your existing design system to make it consumable by AI agents. It is not a design system itself — it's a contract layer that lets agents build UI features by reading schemas and running a CLI, with no prose documentation required.

**Why it matters:** AI agents don't read docs well. ANDS gives them Zod schemas, typed state machines, and a CLI governor they can loop on until the output is correct. Swap the underlying design system by swapping one adapter package.

---

## Setup

**Prerequisites:** Node 20+, pnpm 9+

```bash
git clone https://github.com/thorn14/ands
cd ands
pnpm install
pnpm build
```

---

## Architecture

```
Foundation (rigid, no internal deps)
  @ands/contracts           — core types: Result, Brand, AndsPlugin
  @ands/foundation-tokens   — DTCG token validation + build
  @ands/foundation-primitives — accessible component contracts

Interaction Kit (structural)
  @ands/interaction-kit     — UX patterns: editable-form schema + state machine
  @ands/ands-cli            — CLI governor: validate, scaffold, audit-tokens

DS Adapters (per design system — live in examples/)
  ds-adapter-example        — template for connecting any design system
  ds-adapter-gamut          — gamut-all semantic token adapter + plugin

Feature Lab (working proofs)
  editable-form-example     — validates via `ands validate`
  gamut-form-example        — validates with gamut-all tokens
```

Strict boundary: Foundation → Interaction Kit → Feature Lab. Adapters import Foundation + Interaction Kit only. Core packages never depend on adapters.

---

## CLI Quick Start

```bash
# Run via TypeScript (no build required)
pnpm tsx packages/ands-cli/src/bin.ts <command>

# Or after build
node packages/ands-cli/dist/bin.js <command>
```

| Command | What it does |
|---------|-------------|
| `ands validate <file>` | Validate an intent file against its pattern schema |
| `ands scaffold --pattern editable-form --output ./src/form --name my-form` | Generate boilerplate |
| `ands audit-tokens` | Find hardcoded token values in source |
| `ands schema` | List all patterns and commands at runtime |
| `ands run <name> [args]` | Run a plugin command (e.g., from a DS adapter) |

All output is JSON. Exit code `0` = success.

---

## Agent Workflow

1. Read `packages/interaction-kit/src/manifest.ts` — discover available patterns
2. Read the pattern schema (e.g., `editable-form/schema.ts`) — understand the intent shape
3. Write `intent.ts` satisfying the schema
4. Run `ands validate ./src/intent.ts` in a loop until exit code 0

---

## Packages

| Package | Purpose |
|---------|---------|
| [`@ands/contracts`](packages/contracts/) | Core types: `Result<T,E>`, `Brand<T,K>`, `AndsPlugin` |
| [`@ands/foundation-tokens`](packages/foundation-tokens/) | DTCG token validation and CSS/TS build |
| [`@ands/foundation-primitives`](packages/foundation-primitives/) | Accessible component contracts (Button, Input) |
| [`@ands/interaction-kit`](packages/interaction-kit/) | Reusable UX patterns as schemas + state machines |
| [`@ands/ands-cli`](packages/ands-cli/) | CLI governor tool |
| [`ds-adapter-example`](examples/ds-adapter-example/) | Template for building a DS adapter |
| [`ds-adapter-gamut`](examples/ds-adapter-gamut/) | gamut-all adapter + WCAG compliance plugin |
| [`editable-form-example`](examples/feature-lab/editable-form-example/) | Working editable-form proof |
| [`gamut-form-example`](examples/feature-lab/gamut-form-example/) | Working gamut-all form proof |
