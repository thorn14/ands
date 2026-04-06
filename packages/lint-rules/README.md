# @ands/lint-rules

Reference plugin for ANDS governance lint rules. Registers the `ands lint` command and provides
three built-in rules that enforce design-system token usage and prop conventions across TypeScript,
JavaScript, and CSS source files.

## What it provides

**Command:** `ands lint`

**Rules:**

| Rule | Description |
|------|-------------|
| `no-raw-token-value` | Disallows hardcoded hex colours and px/rem/em values — use CSS token variables instead |
| `no-deprecated-prop` | Disallows props that adapters have marked as deprecated |
| `prop-naming-consistency` | Ensures prop names match the naming conventions declared by the active adapter |
| `no-hardcoded-string` | Detects untranslated user-facing strings in JSX/TSX (i18n) via OXC AST analysis |
| `pii-exposure` | Detects PII patterns (emails, SSNs, credit cards, etc.) in source code string literals |

Rules are composable: additional plugins can contribute their own `lintRules` and they are merged
into the same `ands lint` run.

## Installation

```
pnpm add @ands/lint-rules
```

## Usage — ands.config.ts

```ts
import { lintPlugin } from '@ands/lint-rules';
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapters: ['@ands/ds-adapter-example'],
  content: ['./src/**/*.{ts,tsx,css}'],
  plugins: [lintPlugin],
});
```

Then run:

```
pnpm ands lint
```

Exit code `0` on success, `4` on lint errors.

## API

```ts
import { lintPlugin, noRawTokenValue, noDeprecatedProp, propNamingConsistency } from '@ands/lint-rules';
```

| Export | Type | Description |
|--------|------|-------------|
| `lintPlugin` | `AndsPlugin` | Full plugin object — register this in `ands.config.ts` |
| `noRawTokenValue` | `AndsLintRule` | Standalone rule, usable in custom plugins |
| `noDeprecatedProp` | `AndsLintRule` | Standalone rule, usable in custom plugins |
| `propNamingConsistency` | `AndsLintRule` | Standalone rule, usable in custom plugins |

Rules implement `AndsLintRule` from `@ands/contracts` and can be composed into any plugin that
declares a `lintRules` array.
