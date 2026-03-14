/**
 * @module @ands/ds-adapter-example
 * @description Example adapter showing how to connect an existing design system to ANDS.
 *
 * **This is the Adapter Layer** — one adapter per host DS.
 * Swapping your DS = swapping this package (not the core contracts).
 *
 * **What an adapter provides:**
 * | Export                  | Purpose                                              |
 * |-------------------------|------------------------------------------------------|
 * | `buildAdapterTokenIndex`| Maps host DS tokens → ANDS TokenIndex for audit      |
 * | `tokenVar()`            | Host DS CSS variable for an ANDS token path          |
 * | `Button`                | Host DS Button satisfying ANDS ButtonContract        |
 * | `Input`                 | Host DS Input satisfying ANDS InputContract          |
 * | `acmeDsAuditConfig`     | `AuditConfig` for `ands audit-tokens`                |
 * | `renderEditableForm()`  | Renders an editable form intent with host DS comps   |
 *
 * **Boundary rule:**
 * This package imports Foundation and Interaction Kit.
 * Feature Lab imports THIS package to get host DS primitives.
 * Never import Feature Lab from an adapter.
 */

export { buildAdapterTokenIndex, tokenVar, acmeCssVar } from './token-map.js';
export { Button } from './components/button.js';
export { Input } from './components/input.js';
export { acmeDsAuditConfig } from './audit-config.js';
export { renderEditableForm } from './scaffold-templates/editable-form.js';
export type { RenderedForm, RenderedField } from './scaffold-templates/editable-form.js';
