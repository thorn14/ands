# @ands/guidelines

ANDS guideline registry plugin. Provides the `ands guideline` command for managing a local
registry of design-system guidelines stored in `ands-guidelines.json` at the project root.

## What it provides

**Command:** `ands guideline <subcommand>`

| Subcommand | Description |
|------------|-------------|
| `list` | Print all registered guidelines |
| `get <id>` | Fetch a single guideline by id |
| `validate` | Check for duplicate ids, empty titles, and empty paths |
| `add` | Append a new guideline entry to the registry |

## Installation

```
pnpm add @ands/guidelines
```

## Usage — ands.config.ts

```ts
import { guidelinesPlugin } from '@ands/guidelines';
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapters: ['@ands/ds-adapter-example'],
  plugins: [guidelinesPlugin],
});
```

Common operations:

```
pnpm ands guideline list
pnpm ands guideline get colour-contrast
pnpm ands guideline validate
pnpm ands guideline add \
  --id colour-contrast \
  --title "Colour Contrast" \
  --category a11y \
  --path ./docs/colour-contrast.md \
  --description "WCAG 2.1 AA minimum contrast requirements" \
  --tags wcag,colour
```

Exit code `0` on success, `4` on validation errors or missing arguments.

## Registry file

Guidelines are persisted as a JSON array in `ands-guidelines.json` at the working directory.
Each entry conforms to `GuidelineEntry` from `@ands/contracts`:

```ts
interface GuidelineEntry {
  id: string;
  title: string;
  category: string;
  path: string;
  description?: string;
  tags?: string[];
}
```

## API

```ts
import { guidelinesPlugin } from '@ands/guidelines';
```

| Export | Type | Description |
|--------|------|-------------|
| `guidelinesPlugin` | `AndsPlugin` | Full plugin object — register this in `ands.config.ts` |
