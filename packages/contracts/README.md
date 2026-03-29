# @ands/contracts

Core portability contracts for the Agent-Native Design System. Start here when
building any ANDS-compatible package, plugin, or adapter.

**Boundary rule:** This package has no internal ANDS dependencies. It imports
only `zod`. Any tier — Foundation, Interaction Kit, Feature Lab, adapters — may
depend on it safely.

## Install

```
pnpm add @ands/contracts
```

## Exports

### Core utilities

| Export | Description |
|--------|-------------|
| `Brand<T, K>`, `brand()`, `Unbrand<B>` | Opaque branded types for compile-time ID safety |
| `TokenId`, `PatternId`, `FieldId`, `IntentId`, `UserId`, `OrderId` | Built-in branded ID types |
| `Result<T, E>`, `Ok<T>`, `Err<E>` | Discriminated union for tool outputs |
| `ok()`, `err()`, `isOk()`, `isErr()`, `mapOk()`, `mapErr()`, `andThen()` | Result constructors and combinators |
| `assertNever()` | Exhaustiveness helper for switch statements |
| `zodHelpers` | Shared Zod schema utilities |

### Config

| Export | Description |
|--------|-------------|
| `AndsConfig` | Shape of the project-level `ands.config.ts` default export |
| `EnforcementConfig`, `TokenEnforcementConfig`, `A11yEnforcementConfig`, `PropEnforcementConfig` | Enforcement sub-configs |
| `NarrativeConfig`, `BrowserConfig`, `VisionConfig` | Narrative (AI-assisted review) config |
| `McpConfig`, `McpUpstreamConfig` | MCP server config |
| `CouncilConfig` | Human-judgment escalation config |
| `SilenceConfig` | Config for suppressing known issues |
| `ExcludeDirective` | Exclude directive for merged array fields |
| `mergeConfig()` | Depth-first preset merge utility |
| `defaults` | Default config values |

### Plugin system

| Export | Description |
|--------|-------------|
| `AndsPlugin` | Plugin object registered in `ands.config.ts` |
| `PatternRegistration` | Register a new interaction pattern with `ands validate` and `ands scaffold` |
| `ScaffoldFile`, `ScaffoldOptions` | Types for scaffold template generators |
| `PluginCommand` | CLI command contributed as `ands run <name>` |
| `TopLevelCommand` | CLI command contributed as `ands <name>` |

### Adapter

| Export | Description |
|--------|-------------|
| `AndsAdapter` | Data contract connecting a design system to ANDS (token map, audit config, Storybook URL) |
| `AuditConfig` | Configuration for `ands audit-tokens` |

### CLI output

| Export | Description |
|--------|-------------|
| `CliOutput` | Universal output envelope emitted to stdout by all ANDS commands |
| `AndsIssue` | Single issue item inside `CliOutput.issues` |
| `IssueCategory`, `TriageLevel` | Discriminant enums for issues |
| `IssueLoc` | File/line/col location attached to an issue |
| `TokenIndex` | Flat token map (`path → value`) produced by the build step |

### Enforcement and narrative

| Export | Description |
|--------|-------------|
| `AndsLintRule`, `AndsLintContext` | Contract for lint rules (`AndsPlugin.lintRules`) |
| `A11yRunner` | Contract for a11y runners (`AndsPlugin.a11yRunners`) |
| `HealthMetric` | Contract for health metrics (`AndsPlugin.healthMetrics`) |
| `NarrativeProvider` | LLM-based narrative operation provider |
| `BrowserProvider`, `AndsFlow`, `FlowStep` | Browser automation for narrative testing |
| `TriageRule`, `TriageField`, `TriageResult`, `TriageContext` | API surface triage contracts |
| `DocSource`, `McpEnrichment`, `GuidelinesConfig` | Docs, MCP, and guidelines contracts |
