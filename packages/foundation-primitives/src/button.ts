/**
 * @module button
 * @description Portable ButtonContract with mandatory accessible name at type level.
 *
 * **Accessible name requirement:**
 * A button MUST have an accessible name via one of:
 *   - `aria-label` (always accepted; use when no visible text is present)
 *   - `aria-labelledby` pointing to an element with text
 *   - `children` (visible text content — most common case)
 *
 * This is modeled as a discriminated union so TypeScript enforces the constraint
 * without requiring agents to guess which prop is needed.
 *
 * **Usage by adapters:**
 * DS adapters wrap their host Button component to accept `ButtonProps` and
 * satisfy `ButtonContract`. See `@ands/ds-adapter-example` for a reference.
 *
 * @example
 * ```ts
 * // OK — visible text
 * const btn: ButtonProps = { children: 'Submit', onClick: () => {} };
 *
 * // OK — icon button with aria-label
 * const icon: ButtonProps = { 'aria-label': 'Close', onClick: () => {} };
 *
 * // OK — labeled by another element
 * const ref: ButtonProps = { 'aria-labelledby': 'heading-id', onClick: () => {} };
 *
 * // TYPE ERROR — no accessible name provided
 * const bad: ButtonProps = { onClick: () => {} };
 * ```
 */

// ---------------------------------------------------------------------------
// Button variants and sizes
// ---------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

// ---------------------------------------------------------------------------
// Shared props (all buttons share these)
// ---------------------------------------------------------------------------

interface ButtonBaseProps {
  /** Visual style variant. @default 'primary' */
  variant?: ButtonVariant;
  /** Size variant. @default 'md' */
  size?: ButtonSize;
  /** Disable the button and prevent interaction. */
  disabled?: boolean;
  /** Show a loading spinner and prevent interaction. */
  loading?: boolean;
  /** Additional CSS class names (adapter-managed). */
  className?: string;
  /** Click handler. */
  onClick?: () => void;
  /** Form submission type. @default 'button' */
  type?: 'button' | 'submit' | 'reset';
  /** Arbitrary data attributes. */
  [key: `data-${string}`]: string | undefined;
}

// ---------------------------------------------------------------------------
// Accessible name variants (discriminated union)
// ---------------------------------------------------------------------------

/**
 * Button with visible text content (most common).
 * The accessible name comes from `children`.
 */
interface ButtonWithChildren extends ButtonBaseProps {
  /** Visible text or element content. Provides the accessible name. */
  children: React.ReactNode;
  'aria-label'?: never;
  'aria-labelledby'?: never;
}

/**
 * Icon button or button without visible text.
 * Must provide `aria-label` directly.
 */
interface ButtonWithAriaLabel extends ButtonBaseProps {
  children?: React.ReactNode;
  /** Accessible name for icon buttons or buttons without visible text. */
  'aria-label': string;
  'aria-labelledby'?: never;
}

/**
 * Button labeled by another element in the DOM.
 * Used when the label lives elsewhere on the page.
 */
interface ButtonWithAriaLabelledBy extends ButtonBaseProps {
  children?: React.ReactNode;
  'aria-label'?: never;
  /** ID of the element that provides the accessible name. */
  'aria-labelledby': string;
}

/**
 * ButtonProps — one of three accessible name strategies must be provided.
 * TypeScript enforces this at compile time via discriminated union.
 */
export type ButtonProps = ButtonWithChildren | ButtonWithAriaLabel | ButtonWithAriaLabelledBy;

// ---------------------------------------------------------------------------
// Contract interface (implemented by adapters)
// ---------------------------------------------------------------------------

/**
 * DS adapters must satisfy this contract.
 * The component function accepts `ButtonProps` and returns a renderable element.
 *
 * @example
 * ```ts
 * // In ds-adapter-example:
 * export const Button: ButtonContract = (props) => <AcmeButton {...mapProps(props)} />;
 * ```
 */
export interface ButtonContract {
  (props: ButtonProps): unknown; // unknown = framework-agnostic (React.ReactElement, string, etc.)
  displayName?: string;
}

// ---------------------------------------------------------------------------
// Validation helper (runtime check for agents/CLI)
// ---------------------------------------------------------------------------

/**
 * Validate that a button props object satisfies the accessible name requirement.
 * Returns `{ valid: true }` or `{ valid: false, reason: string }`.
 *
 * Useful for CLI audit commands and automated accessibility checks.
 */
export function validateButtonAccessibility(
  props: Record<string, unknown>,
): { valid: true } | { valid: false; reason: string } {
  const hasChildren =
    props['children'] !== undefined &&
    props['children'] !== null &&
    props['children'] !== '';
  const hasAriaLabel =
    typeof props['aria-label'] === 'string' && props['aria-label'].trim().length > 0;
  const hasAriaLabelledBy =
    typeof props['aria-labelledby'] === 'string' &&
    props['aria-labelledby'].trim().length > 0;

  if (hasChildren || hasAriaLabel || hasAriaLabelledBy) {
    return { valid: true };
  }

  return {
    valid: false,
    reason:
      'Button has no accessible name. Provide one of: children (visible text), ' +
      'aria-label (icon buttons), or aria-labelledby (label in DOM).',
  };
}

// ---------------------------------------------------------------------------
// Note: React import is intentionally absent — this is a framework-agnostic
// contract module. The `React.ReactNode` type reference is illustrative.
// Adapters import their own framework types.
// ---------------------------------------------------------------------------
// Re-export a React-compatible type alias for documentation purposes:
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace React {
  type ReactNode = unknown;
}
