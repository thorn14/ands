# @ands/mcp-server

ANDS Model Context Protocol server plugin. Provides the `ands serve` command that starts an MCP
server exposing design-system resources to AI tools and agents under the `ands://` URI scheme.

## What it provides

**Command:** `ands serve [--port <number>]`

Default port: `3333`.

**Registered resources:**

| URI | Description |
|-----|-------------|
| `ands://policy` | Design system governance policy and token usage rules |
| `ands://guidelines/INDEX` | Index of all registered design-system guidelines |
| `ands://tokens` | Foundation token definitions and current values |
| `ands://patterns` | Registered interaction patterns and their schemas |
| `ands://health` | Latest design-system health metrics |

The plugin also registers a default `ands-context` MCP enrichment that annotates upstream MCP
responses with an `_ands` marker. Additional enrichments from other plugins are merged
automatically via the `mcpEnrichments` extension point.

## Installation

```
pnpm add @ands/mcp-server
```

## Usage — ands.config.ts

```ts
import { mcpServerPlugin } from '@ands/mcp-server';
import { defineConfig } from '@ands/contracts';

export default defineConfig({
  adapters: ['@ands/ds-adapter-example'],
  plugins: [mcpServerPlugin],
});
```

Start the server:

```
pnpm ands serve
pnpm ands serve --port 4444
```

The command returns a `CliOutput` listing the bound port, registered resource URIs, and active
enrichments. Exit code `4` is returned for an invalid port value.

## API

```ts
import { mcpServerPlugin } from '@ands/mcp-server';
```

| Export | Type | Description |
|--------|------|-------------|
| `mcpServerPlugin` | `AndsPlugin` | Full plugin object — register this in `ands.config.ts` |

`McpEnrichment`, `McpEnrichmentContext`, and `McpResponse` types are defined in `@ands/contracts`.
