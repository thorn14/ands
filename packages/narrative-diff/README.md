# @ands/narrative-diff

ANDS narrative plugin for diff summaries, drift detection, and migration drafting. Provides
three LLM-assisted commands for understanding how the design system has changed over time and
for planning component migrations.

## What it provides

**Commands:**

| Command | Description |
|---------|-------------|
| `ands diff-summary` | Summarise design-system changes between two git commits |
| `ands detect-drift` | Scan the codebase for one-off components that deviate from known patterns |
| `ands draft-migration` | Draft a migration plan for a component to a target design-system pattern |

All three commands require an LLM provider to be configured in `ands.config.ts`. Without one,
each command exits with `ok: true` and an `llm-not-configured` info issue.

## Installation

```
pnpm add @ands/narrative-diff
```

## Usage — ands.config.ts

```ts
import { narrativeDiffPlugin } from '@ands/narrative-diff';
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapters: ['@ands/ds-adapter-example'],
  plugins: [narrativeDiffPlugin],
  // LLM provider configuration required for commands to produce output
});
```

Run the commands:

```
pnpm ands diff-summary
pnpm ands detect-drift
pnpm ands draft-migration
```

## LLM provider

Commands produce meaningful output only when an LLM provider is registered in the ANDS config.
Without a provider, each command returns an informational message and exits successfully (exit
code `0`) so that CI pipelines are not broken by an unconfigured provider.

## API

```ts
import { narrativeDiffPlugin } from '@ands/narrative-diff';
```

| Export | Type | Description |
|--------|------|-------------|
| `narrativeDiffPlugin` | `AndsPlugin` | Full plugin object — register this in `ands.config.ts` |
