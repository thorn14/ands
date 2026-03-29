# @ands/foundation-tokens

A reference library for DTCG/W3C Design Token Community Group compatible token authoring,
validation, and build output. Portable — not tied to any UI framework or renderer.

## Description

Provides Zod schemas and runtime utilities for working with structured design token files.
Tokens are organized as nested groups with typed leaf values and can be flattened to a
`path -> value` map for consumption by build tools, CSS var generators, or audit CLIs.

This package occupies the Foundation (Rigid) layer: it must not import from
`@ands/interaction-kit` or any Feature Lab package.

## Supported token types

`color` | `dimension` | `fontFamily` | `fontWeight` | `lineHeight` |
`shadow` | `number` | `string` | `duration` | `cubicBezier`

## Key exports

| Export | Purpose |
|---|---|
| `referenceTokens` | Opinionated reference token set (optional preset) |
| `validateTokenGroup` | Validate any DTCG-compatible token object; returns errors |
| `flattenTokens` | Flatten a token tree to a `path -> value` map (`TokenIndex`) |
| `tokenTypeSchema` | Zod enum of all supported `$type` values |
| `tokenLeafSchema` | Zod schema for a single token leaf node |
| `isValidTokenName` | Runtime check for naming constraints |
| `TOKEN_NAME_PATTERN` | Regex for valid token/group key names |
| `SUPPORTED_TOKEN_TYPES` | `as const` array of all valid `$type` strings |
| `TokenGroup`, `TokenLeaf`, `TokenIndex` | Core TypeScript types |

## Build outputs

Running `pnpm build:tokens` emits:

- `dist/tokens.css` — CSS custom properties
- `dist/tokens.ts` — TypeScript constants
- `dist/tokens.index.json` — Flat audit index

## Usage example

```ts
import {
  validateTokenGroup,
  flattenTokens,
  type TokenGroup,
} from '@ands/foundation-tokens';

const tokens: TokenGroup = {
  color: {
    $type: 'color',
    brand: {
      primary: { $value: '#3B82F6' },
      secondary: { $value: '#6366F1' },
    },
  },
};

const result = validateTokenGroup(tokens);
if (!result.ok) {
  console.error(result.errors);
}

const flat = flattenTokens(tokens);
// { 'color.brand.primary': '#3B82F6', 'color.brand.secondary': '#6366F1' }
```

## Token naming rules

- Lowercase alphanumeric, hyphens, and underscores only
- Must not start with `$` (reserved for DTCG metadata)
- Must not contain `.` (path separator) or `{` / `}` (alias syntax)
