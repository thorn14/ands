# @ands/narrative-browser

ANDS narrative plugin for visual and flow auditing via browser automation. Provides two
Playwright-backed commands for auditing rendered pages against design-system tokens and for
replaying user flows to verify design-system compliance at each step.

## What it provides

**Commands:**

| Command | Description |
|---------|-------------|
| `ands vision-audit` | Capture a page screenshot and audit it against design-system tokens |
| `ands flow-audit` | Replay a user flow and audit each step against design-system patterns |

Both commands require Playwright to be installed as a project dependency. Without it, each
command exits with `ok: true` and a `playwright-not-installed` info issue so that CI pipelines
are not blocked on machines that have not installed the browser tooling.

## Installation

```
pnpm add @ands/narrative-browser
pnpm add -D playwright
```

## Usage — ands.config.ts

```ts
import { narrativeBrowserPlugin } from '@ands/narrative-browser';
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapters: ['@ands/ds-adapter-example'],
  plugins: [narrativeBrowserPlugin],
});
```

Run the commands:

```
pnpm ands vision-audit --url https://staging.example.com
pnpm ands flow-audit --url https://staging.example.com
```

## Peer dependencies

Playwright must be installed separately. The plugin will report an informational issue
rather than throwing if the dependency is absent.

```
pnpm add -D playwright
```

## API

```ts
import { narrativeBrowserPlugin } from '@ands/narrative-browser';
```

| Export | Type | Description |
|--------|------|-------------|
| `narrativeBrowserPlugin` | `AndsPlugin` | Full plugin object — register this in `ands.config.ts` |
