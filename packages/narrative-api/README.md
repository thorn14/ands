# @ands/narrative-api

ANDS narrative plugin for API surface analysis and field triage. Provides a command and a set
of deterministic triage rules for classifying API response fields by their relevance to the
design system.

## What it provides

**Command:** `ands api-surface --url <endpoint>`

Fetches an API endpoint, analyses the response shape, and classifies each field using the
built-in triage rules. LLM-assisted classification is applied after the deterministic rules
when a provider is configured.

**Built-in triage rules:**

| Pattern | Triage | Reason |
|---------|--------|--------|
| `/_id|_code|_key|_ref|_hash$/` | `internal` | Internal identifier suffix |
| `/^(internal_|raw_|legacy_)/` | `internal` | Internal/raw/legacy prefix |
| `/_password|_token|_secret/` | `sensitive` | Sensitive data indicator |
| `/^(cost_|margin_|rate_)/` | `sensitive` | Financial/sensitive prefix |
| `/_at$|_date$|_time$/` | `low` | Temporal metadata suffix |

## Installation

```
pnpm add @ands/narrative-api
```

## Usage — ands.config.ts

```ts
import { narrativeApiPlugin } from '@ands/narrative-api';
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapters: ['@ands/ds-adapter-example'],
  plugins: [narrativeApiPlugin],
});
```

Run the command:

```
pnpm ands api-surface --url https://api.example.com/products
```

Without a `--url` flag the command returns an informational prompt and exits `0`.

## LLM provider

When an LLM provider is configured in `ands.config.ts`, the `api-surface` command uses it for
fields that do not match any deterministic triage rule. Without a provider, only the built-in
rules run.

## API

```ts
import { narrativeApiPlugin, builtInTriageRules } from '@ands/narrative-api';
```

| Export | Type | Description |
|--------|------|-------------|
| `narrativeApiPlugin` | `AndsPlugin` | Full plugin object — register this in `ands.config.ts` |
| `builtInTriageRules` | `TriageRule[]` | Deterministic rules, importable for custom plugins |

`TriageRule` is defined in `@ands/contracts`.
