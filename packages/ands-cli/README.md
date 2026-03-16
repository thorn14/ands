# @ands/ands-cli

The CLI governor for ANDS. Agents run this in a loop until exit code 0.

**Why it matters:** All output is JSON (machine-readable) so agents can parse errors, apply fixes, and retry — without reading documentation. The exit code contract is stable and versioned.

---

## Usage

```bash
# Development (no build required)
pnpm tsx packages/ands-cli/src/bin.ts <command>

# After build
node packages/ands-cli/dist/bin.js <command>
# or: ands <command>  (if globally linked)
```

---

## Commands

### `ands validate <file>`

Validates an intent file against its pattern schema.

```bash
ands validate ./src/intent.ts
```

```json
{
  "outputVersion": "1.0.0",
  "command": "validate",
  "file": "./src/intent.ts",
  "ok": false,
  "exitCode": 3,
  "summary": "Zod parse failed: 1 issue",
  "issues": [
    {
      "category": "schema",
      "code": "ZOD_PARSE_FAILURE",
      "message": "Required field missing",
      "path": ["logic", "onSuccess"],
      "hint": "Must be one of: toast, banner, redirect",
      "suggestion": "ands schema validate"
    }
  ]
}
```

### `ands scaffold --pattern <kind> --output <dir> --name <name>`

Generates boilerplate for a pattern. Use `--dry-run` to preview.

```bash
ands scaffold --pattern editable-form --output ./src/profile-form --name profile-form
ands scaffold --pattern editable-form --output ./src/profile-form --name profile-form --dry-run
```

### `ands audit-tokens`

Scans source files for hardcoded token values (colors, spacing, etc.) that should use design tokens instead. Use `--stream` for NDJSON output on large codebases.

```bash
ands audit-tokens
ands audit-tokens --stream
```

### `ands schema [command]`

Introspect the CLI at runtime — no docs needed.

```bash
ands schema            # list all patterns and commands
ands schema validate   # args + output shape for validate
```

### `ands run <name> [args]`

Run a plugin command registered via `ands.config.ts`.

```bash
ands run compliance src/tokens.json
ands run test src/tokens.json
```

---

## Exit Codes

| Code | Meaning | Retry? |
|------|---------|--------|
| `0` | Success | — |
| `1` | Module load failure | No |
| `2` | Intent export missing or invalid | No |
| `3` | Zod schema parse failure | No |
| `4` | Contract rule violation | No |
| `5` | Internal CLI error | No |
| `6` | Transient error (network, file lock, timeout) | Yes |

---

## Plugin Config

Create `ands.config.ts` in your project root to register DS adapter plugins:

```ts
import { gamutPlugin } from '@ands/ds-adapter-gamut';

export default {
  adapter: '@ands/ds-adapter-gamut',
  plugins: [gamutPlugin],
};
```

Without a config file, the CLI runs with core patterns only.
