# @ands/ands-cli

ANDS Governor CLI: validate intents, audit tokens, and scaffold features.

## Usage

**Development (no build required):**

```bash
pnpm tsx packages/ands-cli/src/bin.ts <command> [args]
```

**Production (after `pnpm build`):**

```bash
node packages/ands-cli/dist/bin.js <command> [args]
# or, if installed globally:
ands <command> [args]
```

## Commands

### Built-in

| Command | Description |
|---|---|
| `validate <file>` | Validate an intent file against its pattern schema |
| `audit-tokens [dir]` | Scan source files for hardcoded off-system values |
| `scaffold --pattern <p> --output <dir> --name <name>` | Generate a feature scaffold from a pattern |
| `schema [pattern]` | Print the JSON schema for a pattern (or list all patterns) |
| `init` | Create a starter `ands.config.ts` in the current directory |

### Plugin commands

Plugins registered in `ands.config.ts` may add top-level commands:

| Command | Provided by |
|---|---|
| `ands lint` | lint plugin |
| `ands a11y` | a11y plugin |
| `ands docs` | docs plugin |
| `ands audit` | audit plugin |
| `ands serve` | serve plugin |
| `ands guideline` | guideline plugin |

Plugin commands are also accessible via `ands run <name>`.

## Exit Codes

| Code | Constant | Meaning |
|---|---|---|
| 0 | `Success` | Command completed without errors |
| 1 | `ModuleLoadFailure` | Intent file could not be imported |
| 2 | `IntentExportInvalid` | No `intent` export, or export has wrong shape |
| 3 | `SchemaParseFailure` | Zod schema parse failed |
| 4 | `ContractRuleFailure` | Structural contract rule violated |
| 5 | `InternalError` | Unexpected error in the CLI itself |
| 6 | `TransientError` | Retriable failure (network, file lock, timeout) |

Codes 1-5 are permanent — fix the underlying issue. Code 6 is transient — retry with exponential backoff (2s, 4s, 8s, 16s).

All commands emit JSON with an `exitCode` field that mirrors the process exit code.

## Configuration

The CLI loads `ands.config.ts` from the current working directory at startup. The file is optional; if absent, the CLI runs with an empty config and core patterns only.

```ts
// ands.config.ts
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapter: 'react',
  plugins: [
    { name: 'lint', /* ... */ },
  ],
});
```

Config supports:
- **Presets** — named preset strings that expand to a known plugin set.
- **YAML compat** — configs can also be expressed in `ands.config.yaml` for environments without a TypeScript runtime.

## Examples

```bash
# Validate a single intent file
pnpm tsx packages/ands-cli/src/bin.ts validate src/features/profile/intent.ts

# Audit the entire project for hardcoded tokens
pnpm tsx packages/ands-cli/src/bin.ts audit-tokens

# Scaffold a new editable-form feature
pnpm tsx packages/ands-cli/src/bin.ts scaffold --pattern editable-form --output src/features/profile --name profile

# List available pattern schemas
pnpm tsx packages/ands-cli/src/bin.ts schema
```
