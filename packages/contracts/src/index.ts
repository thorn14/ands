/**
 * @module @ands/contracts
 * @description Core portability contracts for the Agent-Native Design System.
 *
 * **Start here** when building any ANDS-compatible package or feature.
 *
 * | Export         | Purpose                                              |
 * |----------------|------------------------------------------------------|
 * | `Brand<T,K>`   | Opaque branded types for compile-time ID safety      |
 * | `brand()`      | Runtime brand constructor (identity fn)              |
 * | `UserId` etc.  | Pre-defined branded ID examples                      |
 * | `Result<T,E>`  | Discriminated union for tool outputs                 |
 * | `ok()` / `err()` | Result constructors                                |
 * | `assertNever()`| Exhaustive switch guard (place in default branches)  |
 * | `strictObject()`| Zod helper: creates strict schema (no unknown keys) |
 * | `z`            | Re-exported `zod` namespace                          |
 *
 * **Boundary rule:** This package has no internal ANDS dependencies.
 * It may be used by any tier (Foundation → Interaction Kit → Feature Lab).
 */

export * from './brand.js';
export * from './result.js';
export * from './assert-never.js';
export * from './zod-helpers.js';
export * from './plugin.js';
