# @ands/doc-gen

ANDS documentation generator plugin. Provides the `ands docs` command with two subcommands:
extracting documentation from TypeScript source files and detecting stale documentation whose
corresponding source has been updated since the doc was last written.

## What it provides

**Command:** `ands docs <subcommand>`

| Subcommand | Description |
|------------|-------------|
| `generate` | Extract `@description` and `@example` JSDoc tags from `src/**/*.{ts,tsx}` |
| `stale` | Report `docs/*.md` files whose source counterpart has a newer mtime |

Stale detection compares `src/path/file.ts` against `docs/path/file.md`. A `STALE_DOC` warning
is emitted for each doc that is older than its source file.

## Installation

```
pnpm add @ands/doc-gen
```

## Usage — ands.config.ts

```ts
import { docGenPlugin } from '@ands/doc-gen';
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapters: ['@ands/ds-adapter-example'],
  plugins: [docGenPlugin],
});
```

Run the commands:

```
pnpm ands docs generate   # extract doc metadata to stdout (JSON)
pnpm ands docs stale      # list stale docs; exits 4 when any are found
```

Use `stale` in CI to enforce that documentation is kept current:

```yaml
- run: pnpm ands docs stale
```

## Stale detection rules

A doc is considered stale when `src/foo.ts` has a later modification time than `docs/foo.md`.
Files in `src/` that have no corresponding `.md` file in `docs/` are silently skipped.

## API

```ts
import { docGenPlugin } from '@ands/doc-gen';
```

| Export | Type | Description |
|--------|------|-------------|
| `docGenPlugin` | `AndsPlugin` | Full plugin object — register this in `ands.config.ts` |

The plugin also registers a `DocSource` for TypeScript files on `docSources`, which other plugins
can inspect or extend via `@ands/contracts`.
