# PR Review Fix Plan

## Context
- `research.md` is not present in this branch, so there is no repo research file to read before implementation.

## Files
- `packages/ands-cli/src/commands/schema.ts`: include plugin top-level commands in schema output and correctly describe `ands run <name>` invocation.
- `packages/ands-cli/src/__tests__/schema.test.ts`: cover top-level command discovery and `run` command introspection shape.
- `packages/mcp-server/src/plugin.ts`: make `ands serve` fail clearly until server startup is implemented.
- `packages/vpat/src/plugin.ts`: make `ands vpat` fail clearly when no a11y result input is available instead of generating a misleading clean report.

## Exports And Types
- No new public exports.
- Reuse existing `CliOutput`, `AndsIssue`, `RuntimeRegistry`, `PluginCommand`, and `TopLevelCommand` types.

## Implementation
- Update schema listing to emit built-in commands, top-level plugin commands, and `run` as a distinct built-in command.
- Update per-command schema introspection so `ands schema run` reports plugin command names and preserves the real `ands run <name> [...args]` invocation contract.
- Change `mcp-server`'s `serve` command to return a non-zero permanent failure with a clear placeholder/not-implemented issue.
- Change `vpat` to require explicit issue input from supported command arguments before generating a report.
- Add tests for schema output regressions.

## Verification
- `pnpm exec vitest run packages/ands-cli/src/__tests__/schema.test.ts`
- `pnpm exec vitest run packages/contracts/src/__tests__/merge-config.test.ts packages/contracts/src/__tests__/adapter.test.ts`
- `pnpm -r typecheck`
