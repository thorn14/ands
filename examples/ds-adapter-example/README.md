# ds-adapter-example

A template adapter showing how to connect any existing design system to ANDS. Not published to npm — copy this as a starting point for your own adapter.

**Why it matters:** Adapting a design system to ANDS means three things: (1) map your DS tokens to ANDS canonical paths, (2) wrap your DS components to satisfy the ANDS accessibility contracts, and (3) provide an audit config so `ands audit-tokens` knows what to scan. This package shows all three.

---

## Structure

```
src/
  token-map.ts              — maps host DS tokens to ANDS token paths
  audit-config.ts           — tells ands audit-tokens what to scan
  components/
    button.ts               — wraps host DS Button → ButtonContract
    input.ts                — wraps host DS Input → InputContract
  scaffold-templates/
    editable-form.ts        — renders an editable-form intent using host DS components
  index.ts                  — public exports
```

---

## Token Mapping

Map your design system's token variables to ANDS canonical paths:

```ts
// token-map.ts
export const tokenMap = {
  'color.brand.primary': '--acme-color-primary',
  'color.brand.secondary': '--acme-color-secondary',
  'spacing.4': '--acme-spacing-4',
  // ...
};
```

Then generate CSS references:
```ts
import { tokenVar } from '@ands/ds-adapter-example';
const style = { color: tokenVar('color.brand.primary') };
// → { color: 'var(--acme-color-primary)' }
```

---

## Component Wrapping

Wrap your host DS component to satisfy ANDS contracts:

```ts
// components/button.ts
import type { ButtonContract } from '@ands/foundation-primitives';
import { AcmeButton } from 'acme-design-system';

export const Button: ButtonContract = (props) => <AcmeButton {...props} />;
```

TypeScript enforces accessibility at compile time.

---

## Audit Config

Tell `ands audit-tokens` what patterns to look for in your codebase:

```ts
// audit-config.ts
import type { AuditConfig } from '@ands/contracts';

export const acmeDsAuditConfig: AuditConfig = {
  scanDirs: ['src'],
  tokenIndexPath: 'node_modules/@ands/foundation-tokens/dist/tokens.index.json',
  allowedLiterals: ['transparent', 'inherit', 'currentColor'],
  tokenVarPattern: /var\(--acme-[a-z-]+\)/,
};
```

---

## Building Your Own Adapter

1. Copy this directory
2. Replace `AcmeDS` references with your DS package
3. Fill in `token-map.ts` with your token mappings
4. Wrap each primitive component
5. Export an `AndsPlugin` if you want custom CLI commands (see `ds-adapter-gamut` for an example)
