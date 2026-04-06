# @ands/health

ANDS design-system health metrics plugin. Provides the `ands audit` command with three
built-in metrics that give a quantitative view of design-system adoption and quality.

## What it provides

**Command:** `ands audit`

**Metrics:**

| Metric id | Threshold | Description |
|-----------|-----------|-------------|
| `token-coverage` | 80% | Percentage of `src/` files that import from a token package |
| `a11y-rate` | 70% | Percentage of `src/` files containing `aria-`, `role=`, or `@a11y` annotations |
| `doc-freshness` | 90% | Percentage of `docs/*.md` files that are newer than their `src/` counterpart |

Each metric reports `pass`, `warn`, or `fail`. The overall result is `fail` if any metric fails,
`warn` if any warns, and `pass` otherwise. Exit code `4` is returned when the overall result is
`fail`.

## Installation

```
pnpm add @ands/health
```

## Usage — ands.config.ts

```ts
import { healthPlugin } from '@ands/health';
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapters: ['@ands/ds-adapter-example'],
  plugins: [healthPlugin],
});
```

Run the audit:

```
pnpm ands audit
```

The command outputs a `HealthReport` in the `data` field of the standard `CliOutput` envelope.

## Extending with custom metrics

Other plugins can contribute additional `HealthMetric` objects by declaring a `healthMetrics`
array on their `AndsPlugin`. The `ands audit` command merges all metrics from all plugins before
computing the overall result.

## API

```ts
import { healthPlugin } from '@ands/health';
```

| Export | Type | Description |
|--------|------|-------------|
| `healthPlugin` | `AndsPlugin` | Full plugin object — register this in `ands.config.ts` |

`HealthMetric`, `HealthContext`, `HealthReport`, and `MetricResult` types are defined in
`@ands/contracts`.
