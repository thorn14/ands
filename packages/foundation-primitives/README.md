# @ands/foundation-primitives

A reference library of portable primitive contracts (Button, Input) with mandatory
accessibility enforced at the type level. Not tied to any UI framework or component library.

## Description

Defines the prop shapes and component contracts that DS adapters must satisfy. The core
idea is that interactive elements cannot be created without an accessible name — this
constraint is modeled as a discriminated union so TypeScript catches violations at
compile time, before any runtime or audit tooling runs.

This package occupies the Foundation (Rigid) layer: it must not import from
`@ands/interaction-kit` or any Feature Lab package.

## Key exports

| Export | Purpose |
|---|---|
| `ButtonProps` | Discriminated union: one of `children`, `aria-label`, or `aria-labelledby` required |
| `ButtonContract` | Interface a DS adapter's Button component must satisfy |
| `ButtonVariant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive'` |
| `ButtonSize` | `'sm' \| 'md' \| 'lg'` |
| `validateButtonAccessibility` | Runtime validator — returns `{ valid }` or `{ valid, reason }` |
| `InputProps` | Discriminated union requiring an accessible name for input elements |
| `InputContract` | Interface a DS adapter's Input component must satisfy |
| `InputType` | Supported HTML input type values |
| `InputSize` | Size variants for inputs |
| `validateInputAccessibility` | Runtime a11y validator for input props |

## Usage example

```ts
import type { ButtonProps, ButtonContract } from '@ands/foundation-primitives';
import { validateButtonAccessibility } from '@ands/foundation-primitives';

// Visible text — accessible name comes from children
const submit: ButtonProps = { children: 'Submit', onClick: () => {} };

// Icon button — no visible text, aria-label required
const close: ButtonProps = { 'aria-label': 'Close dialog', onClick: () => {} };

// Labeled by another element
const ref: ButtonProps = { 'aria-labelledby': 'section-heading', onClick: () => {} };

// TYPE ERROR at compile time — no accessible name
// const bad: ButtonProps = { onClick: () => {} };

// Runtime check (used by CLI audit)
const check = validateButtonAccessibility({ onClick: () => {} });
// { valid: false, reason: 'Button has no accessible name. Provide one of: ...' }

// DS adapter implementation
export const Button: ButtonContract = (props) => {
  // map ButtonProps to your host component's props
  return hostButton(mapProps(props));
};
```

## Accessibility contract model

Each interactive primitive uses a discriminated union with three branches:

1. `children` present — visible text provides the accessible name (most common)
2. `aria-label` present — for icon-only buttons or inputs
3. `aria-labelledby` present — label lives elsewhere in the DOM

Exactly one branch must match. TypeScript produces a compile error if none is satisfied.
The `validate*Accessibility` helpers provide the same check at runtime for CLI audits.
