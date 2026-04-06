# @ands/a11y-gate

Reference plugin for ANDS accessibility governance. Registers the `ands a11y` command and
provides three tiered runners that cover static source analysis through full-page audits.
All testing tools are peer dependencies — install only the tiers you need.

## What it provides

**Command:** `ands a11y [--tier static|rendered|page] [--url <url>]`

**Runners:**

| Runner | Tier | Tooling | When to use |
|--------|------|---------|-------------|
| `oxc-static` | `static` | OXC parser + aria-query | Every CI run — no browser required |
| `axe-core-rendered` | `rendered` | axe-core + Playwright | Storybook story audits |
| `lighthouse-page` | `page` | Lighthouse | Staging URL audits |

Running without `--tier` executes all three tiers in sequence.

## Installation

```
pnpm add @ands/a11y-gate
```

Peer dependencies (install only what you need):

```
pnpm add -D @axe-core/playwright playwright   # tier: rendered
pnpm add -D lighthouse pa11y                  # tier: page
```

## Usage — ands.config.ts

```ts
import { a11yPlugin } from '@ands/a11y-gate';
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapters: ['@ands/ds-adapter-example'],
  plugins: [a11yPlugin],
});
```

Run specific tiers:

```
pnpm ands a11y --tier static
pnpm ands a11y --tier rendered --url http://localhost:6006
pnpm ands a11y --tier page --url https://staging.example.com
```

Exit code `0` on success, `4` when any runner reports errors.

## API

```ts
import { a11yPlugin, staticRunner, renderedRunner, pageRunner } from '@ands/a11y-gate';
```

| Export | Type | Description |
|--------|------|-------------|
| `a11yPlugin` | `AndsPlugin` | Full plugin object — register this in `ands.config.ts` |
| `staticRunner` | `A11yRunner` | Tier 1 runner, usable standalone or in custom plugins |
| `renderedRunner` | `A11yRunner` | Tier 2 runner, requires axe-core + Playwright |
| `pageRunner` | `A11yRunner` | Tier 3 runner, requires Lighthouse + pa11y |

Runners implement `A11yRunner` from `@ands/contracts`. Custom runners contributed by other
plugins via `a11yRunners` are automatically merged into the same `ands a11y` execution.
