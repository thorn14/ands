# ANDS — Agent-Native Design System

A governance harness that lets AI agents build, validate, and audit design-system usage — without replacing your existing component library.

ANDS wraps **any** design system (Material UI, Chakra, your internal library) via a thin adapter layer, then provides CLI tools that agents can call with deterministic exit codes and structured JSON output.

## Quick Start

```bash
# Install
pnpm install

# Initialize a project
pnpm tsx packages/ands-cli/src/bin.ts init

# Validate an intent file
pnpm tsx packages/ands-cli/src/bin.ts validate ./src/intent.ts

# Audit for raw token values
pnpm tsx packages/ands-cli/src/bin.ts audit-tokens

# Scaffold a new feature
pnpm tsx packages/ands-cli/src/bin.ts scaffold --pattern editable-form --output ./src/features/my-form --name my-form
```

## Architecture

```
Layer 4  Human Judgment     governance/COUNCIL.md, EXCEPTIONS.md
Layer 3  Narrative           narrative-diff, narrative-browser, narrative-api
Layer 2  Repo Tooling        guidelines, doc-gen, health, mcp-server
Layer 1  Hard Enforcement    lint-rules, a11y-gate
Layer 0  Contracts + CLI     contracts, ands-cli
         Reference Libs      foundation-tokens, foundation-primitives, interaction-kit
```

**Key principle:** Layers only depend downward. `@ands/contracts` sits at the bottom with zero internal dependencies — every other package imports from it.

## Packages

### Engine (published)

| Package | Description |
|---------|-------------|
| `@ands/contracts` | Core portability contracts: branded types, `Result<T,E>`, Zod helpers, plugin interface |
| `@ands/ands-cli` | Governor CLI: validate, audit-tokens, scaffold, schema, init, lint, a11y, docs, audit, serve |

### Reference Libraries (published)

| Package | Description |
|---------|-------------|
| `@ands/foundation-tokens` | DTCG/W3C-compatible token authoring, validation, and build outputs |
| `@ands/foundation-primitives` | Portable primitive contracts (Button, Input) with mandatory a11y at type level |
| `@ands/interaction-kit` | Reusable UX flow patterns as Zod schemas and state machines |

### Plugins (published)

| Package | Description |
|---------|-------------|
| `@ands/lint-rules` | Lint rules: `no-raw-token-value`, `no-deprecated-prop`, `prop-naming-consistency` |
| `@ands/a11y-gate` | A11y testing gate: static JSX checks, axe-core, lighthouse |
| `@ands/guidelines` | Guideline registry: list, get, validate, add |
| `@ands/doc-gen` | Documentation generator with stale-doc detection |
| `@ands/health` | Design-system health metrics: token coverage, a11y rate, doc freshness |
| `@ands/mcp-server` | MCP server exposing design-system resources |
| `@ands/narrative-diff` | Diff summaries, drift detection, migration drafting |
| `@ands/narrative-browser` | Visual and flow auditing via browser automation |
| `@ands/narrative-api` | API surface analysis and field triage |

### Examples

| Directory | Description |
|-----------|-------------|
| `examples/ds-adapter-example` | Sample ds-adapter satisfying `AndsAdapter` |
| `examples/ds-adapter-gamut` | Gamut design system adapter |
| `examples/feature-lab` | Example features using interaction-kit patterns |
| `examples/plugins/sample-plugin-config` | Living example of plugin configuration |

## CLI Commands

| Command | Description | Exit Codes |
|---------|-------------|------------|
| `ands validate <file>` | Validate an intent file against registered schemas | 0=valid, 4=invalid |
| `ands audit-tokens` | Check for raw token values in source files | 0=clean, 4=violations |
| `ands scaffold --pattern <p>` | Generate boilerplate for a pattern | 0=ok |
| `ands schema [--config]` | Print registered schemas or resolved config | 0=ok |
| `ands init` | Generate minimal `ands.config.ts` | 0=ok |
| `ands lint` | Run lint rules (plugin) | 0=clean, 4=violations |
| `ands a11y` | Run accessibility checks (plugin) | 0=clean, 4=violations |
| `ands docs` | Generate documentation (plugin) | 0=ok |
| `ands audit` | Run health metrics (plugin) | 0=healthy |
| `ands serve` | Start MCP server (plugin) | 0=ok |
| `ands guideline <sub>` | Manage guidelines (plugin) | 0=ok |

All commands emit structured JSON to stdout when piped, human-readable output on TTY.

## Extension Model

ANDS is extended through the `AndsPlugin` interface:

```ts
// ands.config.ts
import type { AndsConfig } from '@ands/contracts';

export default {
  adapter: '@mycompany/ds-adapter',
  plugins: [myPlugin],
} satisfies AndsConfig;
```

Plugins can contribute: patterns, commands, top-level commands, lint rules, a11y runners, doc sources, health metrics, MCP enrichments, and triage rules.

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run all tests (Vitest)
pnpm typecheck        # TypeScript strict check across all packages
```

## Governance

- `governance/COUNCIL.md` — Open decisions requiring human judgment
- `governance/EXCEPTIONS.md` — Approved exceptions to governance rules

## License

MIT
