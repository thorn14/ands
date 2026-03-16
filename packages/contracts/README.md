# @ands/contracts

Core portability contracts for the ANDS system. This is the only package with zero internal dependencies — every other package imports from here.

**Why it matters:** Establishes the type primitives the entire system is built on. If you're writing an adapter, a plugin, or a Feature Lab proof, start here.

---

## What's in here

### `Result<T, E>`
Discriminated union for all tool outputs. No exceptions for expected failures.

```ts
import { ok, err, isOk, mapOk, andThen } from '@ands/contracts';

const result = validateSomething(input);
if (isOk(result)) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### `Brand<T, K>` + `brand()`
Opaque branded types for compile-time ID safety. Prevents cross-domain ID confusion.

```ts
import { brand, type UserId, type FieldId } from '@ands/contracts';

const userId = brand<UserId>('user-123');
const fieldId = brand<FieldId>('email');
// userId and fieldId are not assignable to each other — TypeScript error
```

### `assertNever()`
Exhaustive switch guard for state machines. Breaks the build if a case is missing.

```ts
import { assertNever } from '@ands/contracts';

switch (event.type) {
  case 'START_EDIT': return ...;
  case 'CANCEL': return ...;
  default: return assertNever(event); // ← compile error if you add a new event type
}
```

### `strictObject()`
Zod helper for schemas that reject unknown keys.

```ts
import { strictObject } from '@ands/contracts';
const schema = strictObject({ id: z.string(), label: z.string() });
```

### `AndsPlugin`
Interface for extending the CLI with new patterns and commands.

```ts
import type { AndsPlugin } from '@ands/contracts';
export const myPlugin: AndsPlugin = {
  id: 'my-plugin',
  patterns: [...],
  commands: [...],
};
```

### `AuditConfig`
Configuration for `ands audit-tokens` — tells the auditor what paths to scan, what patterns are allowed, and where the token index lives.

---

## Install

```bash
pnpm add @ands/contracts
```

No runtime dependencies. TypeScript 5+ required.
