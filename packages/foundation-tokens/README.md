# @ands/foundation-tokens

DTCG/W3C Design Token Community Group compatible token validation and build system for ANDS.

**Why it matters:** Tokens are the shared vocabulary between your design system and ANDS. This package validates that your tokens conform to the DTCG spec and builds the CSS/TypeScript/JSON outputs that adapters and the audit tool consume.

---

## Token Format

Tokens follow the [W3C DTCG spec](https://design-tokens.github.io/community-group/format/). Each leaf node has a `$value` and `$type`:

```json
{
  "color": {
    "brand": {
      "primary": { "$value": "#0057FF", "$type": "color" }
    }
  }
}
```

**Supported types:** `color`, `dimension`, `fontFamily`, `fontWeight`, `lineHeight`, `shadow`, `number`, `string`, `duration`, `cubicBezier`

**Naming rules:** lowercase alphanumeric, hyphens, underscores only. No `$`, `.`, or `{}` prefixes.

---

## Build Output

Running the build script produces three files in `dist/`:

| File | Contents |
|------|---------|
| `tokens.css` | CSS custom properties (`--color-brand-primary: #0057FF`) |
| `tokens.ts` | TypeScript constants (`export const COLOR_BRAND_PRIMARY = '#0057FF'`) |
| `tokens.index.json` | Flat path → value map for `ands audit-tokens` |

```bash
pnpm build
```

---

## Validate Tokens Programmatically

```ts
import { validateTokenIndex } from '@ands/foundation-tokens';
import { isOk } from '@ands/contracts';

const result = validateTokenIndex(myTokens);
if (!isOk(result)) {
  console.error(result.error);
}
```

---

## Flatten Tokens

```ts
import { flattenTokens } from '@ands/foundation-tokens';

const flat = flattenTokens(myTokens);
// { 'color.brand.primary': '#0057FF', ... }
```

---

## Install

```bash
pnpm add @ands/foundation-tokens
```
