# @ands/foundation-primitives

Portable component contracts for the ANDS system. Enforces accessibility requirements at the TypeScript type level, not just at runtime.

**Why it matters:** Every DS adapter must satisfy these contracts. This guarantees that any component tree built by an agent has valid accessible names — no silent a11y violations.

---

## ButtonContract

The `ButtonProps` type is a discriminated union. TypeScript will reject a button without an accessible name at compile time.

```ts
import type { ButtonProps } from '@ands/foundation-primitives';

// Valid: visible text
const btn: ButtonProps = { children: 'Save' };

// Valid: icon button with aria-label
const iconBtn: ButtonProps = { 'aria-label': 'Close dialog' };

// Valid: aria-labelledby reference
const labelledBtn: ButtonProps = { 'aria-labelledby': 'heading-id' };

// TypeScript error: no accessible name
const invalid: ButtonProps = { onClick: handleClick }; // ← compile error
```

Runtime validation is also available:

```ts
import { validateButtonAccessibility } from '@ands/foundation-primitives';

const result = validateButtonAccessibility(props);
```

---

## InputContract

Same pattern for text inputs — requires an accessible label association.

```ts
import type { InputProps } from '@ands/foundation-primitives';
```

---

## Writing an Adapter

Your adapter wraps a host DS component and satisfies the contract:

```ts
import type { ButtonContract } from '@ands/foundation-primitives';
import { AcmeButton } from 'acme-design-system';

export const Button: ButtonContract = (props) => <AcmeButton {...props} />;
```

---

## Install

```bash
pnpm add @ands/foundation-primitives
```
