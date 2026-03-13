# ANDS — Agent Interaction Guide

> **This file is for agents (Claude Code, Cursor, etc.), not humans.**
> It encodes the workflow, not the usage. Usage is in schemas and JSDoc.

---

## Quick Start (3 steps)

```bash
# 1. Discover patterns
cat packages/interaction-kit/src/manifest.ts

# 2. Read the relevant schema (e.g. editable-form)
cat packages/interaction-kit/src/editable-form/schema.ts

# 3. Validate your intent file in a loop until exit code 0
ands validate ./src/intent.js
```

---

## Annotation Cycle (REQUIRED for ALL feature work)

You MUST follow this cycle for every task:

1. **Research** — Read `research.md` for system context and constraints.
2. **Plan** — Write/update `plan.md` with:
   - Exact file list (paths + purpose)
   - Exports and types you'll define
   - CLI commands to run after implementation
   - How to verify correctness
3. **Implement** — Only after plan is accepted.
4. **Governor Loop** — Run until exit code 0:
   ```bash
   ands validate ./src/<feature>/intent.js
   # Parse JSON. Fix all issues. Repeat.
   ```

---

## CLI Governor Loop

All ANDS CLI commands output JSON to stdout. **Always parse JSON — never eyeball prose.**

```bash
# Validate an intent file
ands validate ./src/features/user-profile/intent.js

# Audit for hardcoded token values (zero violations = clean)
ands audit-tokens

# Scaffold a new feature
ands scaffold --pattern editable-form --output ./src/features/my-form --name my-form

# Parse output programmatically
ands validate ./intent.js | jq '.ok, .issues'
ands validate ./intent.js | jq '.exitCode'  # 0 = success
```

### Exit codes (stable)
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Module load failure (check path/syntax) |
| 2 | Intent export missing or invalid shape |
| 3 | Zod schema parse failure |
| 4 | Contract rule violation |
| 5 | Internal CLI error |

---

## Pattern Usage (Agent Contract)

**Do NOT read markdown for pattern usage. Read the schema files and JSDoc.**

| Step | What to read |
|------|-------------|
| Discover patterns | `packages/interaction-kit/src/manifest.ts` |
| Understand intent shape | Pattern schema (listed in `entrypoints[0]`) |
| Understand state machine | `entrypoints[1]` (state-machine.ts) |
| Understand transitions | `entrypoints[2]` (reducer.ts) |
| Core contracts | `packages/contracts/src/index.ts` |
| Token system | `packages/foundation-tokens/src/index.ts` |
| Primitive contracts | `packages/foundation-primitives/src/index.ts` |

---

## Architectural Boundary Rules

Violating these will cause build failures and lint errors:

```
Foundation (Rigid)       ← contracts, foundation-tokens, foundation-primitives
   ↑ imports allowed
Interaction Kit (Structural)  ← interaction-kit
   ↑ imports allowed
Feature Lab (Flexible)   ← your feature code, examples/
   ↑ imports allowed
DS Adapter               ← ds-adapter-* packages
```

- **Foundation** must NOT import Interaction Kit or Feature Lab
- **Interaction Kit** must NOT import Feature Lab
- **Feature Lab** imports Interaction Kit + Adapters (not preset primitives directly)
- **Adapters** import Foundation + Interaction Kit

---

## Key Contracts (memorize these)

### 1. Branded IDs — never use raw strings for IDs
```ts
import { brand, type FieldId } from '@ands/contracts';
const fieldId = brand<FieldId>('email-field');  // Not: 'email-field'
```

### 2. Result pattern — all tool outputs
```ts
const result = validateTokenGroup(tokens);
if (result.ok) { /* use result.data */ }
else { /* handle result.error */ }
// Never: try { ... } catch { ... } for expected failures
```

### 3. Exhaustive switches — all reducers
```ts
import { assertNever } from '@ands/contracts';
switch (event.type) {
  case 'START_EDIT': ...
  case 'SUBMIT': ...
  default: return assertNever(event); // TypeScript errors if a case is missing
}
```

### 4. Accessible name — required on all interactive primitives
```ts
import type { ButtonProps } from '@ands/foundation-primitives';
// TypeScript enforces one of: children, aria-label, aria-labelledby
const btn: ButtonProps = { 'aria-label': 'Close' };  // OK
const bad: ButtonProps = {};  // TYPE ERROR
```

---

## File Navigation Index

```
packages/
  contracts/src/index.ts          ← Core contracts (start here for types)
  foundation-tokens/src/
    schema.ts                     ← DTCG token format
    tokens.ts                     ← Reference token values (preset)
    validator.ts                  ← Token validator + flattenTokens()
    build.ts                      ← Token build script
  foundation-primitives/src/
    button.ts                     ← ButtonContract + accessible name
    input.ts                      ← InputContract + accessible name
  interaction-kit/src/
    manifest.ts                   ← AGENT START HERE — pattern index
    editable-form/
      schema.ts                   ← Intent shape (Zod + TS)
      state-machine.ts            ← State/event union types
      reducer.ts                  ← Pure reducer + selectors
  ands-cli/src/
    output-schema.json            ← CLI output contract (JSON Schema)
    exit-codes.ts                 ← Stable exit code mapping
    commands/
      validate.ts                 ← ands validate implementation
      audit-tokens.ts             ← ands audit-tokens implementation
      scaffold.ts                 ← ands scaffold implementation
  ds-adapter-example/src/
    token-map.ts                  ← Host DS token → ANDS path mapping
    components/
      button.ts                   ← Host DS Button → ButtonContract
      input.ts                    ← Host DS Input → InputContract
    audit-config.ts               ← AuditConfig for host DS
examples/
  feature-lab/
    editable-form-example/src/
      intent.ts                   ← PORTABILITY PROOF — extends editable-form
      reducer.ts                  ← Feature-specific reducer
```

---

## Do Not

- Do NOT import from Feature Lab in Foundation or Interaction Kit packages
- Do NOT use raw strings where branded IDs are expected
- Do NOT use try/catch for expected failures (use Result pattern)
- Do NOT skip the `assertNever` default in switch statements
- Do NOT read `.md` files for pattern usage — read schemas + JSDoc
- Do NOT push to `main` or `master`
- Do NOT modify `packages/interaction-kit/src/editable-form/schema.ts`
  to accommodate a feature — extend it in your Feature Lab intent instead
