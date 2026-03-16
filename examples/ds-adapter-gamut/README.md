# ds-adapter-gamut

ANDS adapter for [gamut-all](https://github.com/gamut-all/core) — a semantic token production engine with WCAG/APCA compliance checking. Includes a CLI plugin that adds `ands run compliance` and `ands run test` commands.

**Why it matters:** Shows the full adapter + plugin pattern. The gamut plugin extends the ANDS CLI with design-system-specific commands that agents can use in their validation loop.

---

## Setup

```bash
# In your feature project
pnpm add @ands/ds-adapter-gamut

# Create ands.config.ts in your project root:
```

```ts
// ands.config.ts
import { gamutPlugin } from '@ands/ds-adapter-gamut';

export default {
  adapter: '@ands/ds-adapter-gamut',
  plugins: [gamutPlugin],
};
```

---

## Agent CLI Loop

```bash
ands run test src/gamut-tokens.json       # exit 0 = token format valid
ands run compliance src/gamut-tokens.json # exit 0 = WCAG AA compliant
ands audit-tokens                          # exit 0 = no hardcoded values
ands validate ./src/intent.ts             # exit 0 = intent schema valid
```

All commands are runnable in sequence. Fix issues and repeat until all exit 0.

---

## Commands

### `ands run test [file]`

Validates your gamut token JSON against the gamut-all schema. Catches structural errors before compliance checking.

```bash
ands run test src/gamut-tokens.json
```

### `ands run compliance <file>`

Checks token color combinations for WCAG AA contrast compliance. Reports failing pairs with their actual and required contrast ratios.

```bash
ands run compliance src/gamut-tokens.json
```

---

## Token Format

Gamut tokens use a semantic surface model:

```json
{
  "surfaces": {
    "primary": {
      "background": "#0057FF",
      "foreground": "#FFFFFF"
    }
  }
}
```

The adapter maps these to ANDS canonical token paths automatically.

---

## Structure

```
src/
  plugin.ts           — AndsPlugin export (registers commands with CLI)
  token-schema.ts     — Zod schema for gamut token input format
  token-map.ts        — gamut registry → ANDS TokenIndex
  compliance.ts       — WCAG contrast checker → Issue[]
  audit-config.ts     — AuditConfig for gamut CSS variable patterns
  commands/
    compliance.ts     — ands run compliance implementation
    test.ts           — ands run test implementation
```
