# ANDS Enhancement Plan — Implementation Status

## Completed

### Phase A: Real A11y Libraries in a11y-gate
- [x] A1: OXC-powered static runner (`packages/a11y-gate/src/runners/static.ts`)
- [x] A2: Rendered runner with axe-core + Playwright (`packages/a11y-gate/src/runners/rendered.ts`)
- [x] A3: Page runner with Lighthouse (`packages/a11y-gate/src/runners/page.ts`)
- [x] A4: Shared peer-dep resolver (`packages/a11y-gate/src/resolve-peer.ts`)
- [x] A5: MCP fallback tools added to mcp-server
- [x] A6: Tests (static, rendered, page)

### Phase B: VPAT Generator + Compliance Credentials
- [x] B1: New `@ands/vpat` package
- [x] B2: WCAG 2.2 criteria data (`src/wcag-criteria.ts`)
- [x] B3: VPAT template generator (`src/generate-vpat.ts`) — markdown, JSON, HTML
- [x] B4: ACR generator (`src/generate-acr.ts`)
- [x] B5: VpatConfig in contracts
- [x] B6: MCP resource `ands://vpat/report`
- [x] Tests: 13 passing

### Phase C: i18n Checking
- [x] C1: OXC-based `no-hardcoded-string` rule (`packages/lint-rules/src/rules/no-hardcoded-string.ts`)
- [x] C2: I18nConfig in contracts
- [x] C3: MCP tool `ands://lint/i18n`
- [x] C4: Tests

### Phase D: PII Detection
- [x] D1: PII lint rule (`packages/lint-rules/src/rules/pii-exposure.ts`)
- [x] D2: PII triage rules in narrative-api (6 new rules)
- [x] D3: PII health metric (`pii-exposure-rate`)
- [x] D4: PiiConfig in contracts
- [x] D5: Tests (PII exposure + PII triage)

### Phase E: LLM A11y Bugbot
- [x] E1: New `@ands/a11y-bugbot` package
- [x] E2: Reviewer orchestrator (`src/reviewer.ts`)
- [x] E3: Prompt builder (`src/prompt-builder.ts`)
- [x] E4: GitHub PR integration (`src/github-commenter.ts`)
- [x] E5: MCP tools `ands://review/suggest`, `ands://review/explain`
- [x] E6: CI workflow (`.github/workflows/a11y-review.yml`)
- [x] E7: Tests (prompt-builder, response-parser)

## Verification
- Build: ✅ All 21 packages build
- Typecheck: ✅ Clean
- Tests: ✅ 78 passing across 12 test files (contracts, a11y-gate, lint-rules, vpat, a11y-bugbot, narrative-api)
