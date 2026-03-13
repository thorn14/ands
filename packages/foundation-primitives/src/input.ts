/**
 * @module input
 * @description Portable InputContract with mandatory accessible name at type level.
 *
 * **Accessible name requirement:**
 * An `<input>` MUST have an accessible name via one of:
 *   - `aria-label` — direct label string (common for search inputs)
 *   - `aria-labelledby` — references a visible label element by ID
 *   - `label` — a visible label string (adapter renders an associated `<label>`)
 *
 * This is the **preferred variant**: it allows natural label associations while
 * still catching unlabeled inputs at compile time.
 *
 * **Usage by adapters:**
 * Adapters wrap their host Input/TextField component to accept `InputProps` and
 * return a labeled form field. See `@ands/ds-adapter-example`.
 *
 * @example
 * ```ts
 * // OK — visible label (most common)
 * const nameInput: InputProps = { label: 'Full name', name: 'fullName' };
 *
 * // OK — search input with aria-label
 * const search: InputProps = { 'aria-label': 'Search products', name: 'q' };
 *
 * // OK — labeled by external element
 * const linked: InputProps = { 'aria-labelledby': 'billing-heading', name: 'address' };
 *
 * // TYPE ERROR — no accessible name
 * const bad: InputProps = { name: 'mystery' };
 * ```
 */

// ---------------------------------------------------------------------------
// Input types and variants
// ---------------------------------------------------------------------------

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local';

export type InputSize = 'sm' | 'md' | 'lg';

// ---------------------------------------------------------------------------
// Shared props
// ---------------------------------------------------------------------------

interface InputBaseProps {
  /** HTML name attribute (used in form submission). */
  name: string;
  /** HTML input type. @default 'text' */
  type?: InputType;
  /** Current value (controlled input). */
  value?: string;
  /** Default value (uncontrolled). */
  defaultValue?: string;
  /** Placeholder text (not a substitute for an accessible label). */
  placeholder?: string;
  /** Whether the field is required for form submission. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Whether the field is read-only. */
  readOnly?: boolean;
  /** Size variant. @default 'md' */
  size?: InputSize;
  /** Validation error message (displayed below the field). */
  error?: string;
  /** Helper text displayed below the field. */
  hint?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Change handler. */
  onChange?: (value: string) => void;
  /** Blur handler. */
  onBlur?: () => void;
  /** Arbitrary data attributes. */
  [key: `data-${string}`]: string | undefined;
}

// ---------------------------------------------------------------------------
// Accessible name variants
// ---------------------------------------------------------------------------

/**
 * Input with a visible label (renders an associated `<label>` element).
 * This is the preferred form for most inputs.
 */
interface InputWithLabel extends InputBaseProps {
  /** Visible label text. The adapter renders an associated `<label>` element. */
  label: string;
  'aria-label'?: never;
  'aria-labelledby'?: never;
}

/**
 * Input with a direct aria-label (no visible label rendered).
 * Use for search boxes, toolbar inputs, or inputs with adjacent icon labels.
 */
interface InputWithAriaLabel extends InputBaseProps {
  label?: never;
  /** Accessible name string. No visible label is rendered. */
  'aria-label': string;
  'aria-labelledby'?: never;
}

/**
 * Input labeled by an external element in the DOM.
 * Use when the label lives outside the component's render scope.
 */
interface InputWithAriaLabelledBy extends InputBaseProps {
  label?: never;
  'aria-label'?: never;
  /** ID of the element providing the accessible name. */
  'aria-labelledby': string;
}

/**
 * InputProps — one of three accessible name strategies must be provided.
 * TypeScript enforces this at compile time.
 */
export type InputProps = InputWithLabel | InputWithAriaLabel | InputWithAriaLabelledBy;

// ---------------------------------------------------------------------------
// Contract interface
// ---------------------------------------------------------------------------

/**
 * DS adapters must satisfy this contract.
 *
 * @example
 * ```ts
 * export const Input: InputContract = (props) => <AcmeTextField {...mapProps(props)} />;
 * ```
 */
export interface InputContract {
  (props: InputProps): unknown;
  displayName?: string;
}

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

/**
 * Validate that input props satisfy the accessible name requirement at runtime.
 */
export function validateInputAccessibility(
  props: Record<string, unknown>,
): { valid: true } | { valid: false; reason: string } {
  const hasLabel = typeof props['label'] === 'string' && (props['label'] as string).trim().length > 0;
  const hasAriaLabel =
    typeof props['aria-label'] === 'string' && (props['aria-label'] as string).trim().length > 0;
  const hasAriaLabelledBy =
    typeof props['aria-labelledby'] === 'string' &&
    (props['aria-labelledby'] as string).trim().length > 0;

  if (hasLabel || hasAriaLabel || hasAriaLabelledBy) {
    return { valid: true };
  }

  return {
    valid: false,
    reason:
      'Input has no accessible name. Provide one of: label (visible label), ' +
      'aria-label (inline label string), or aria-labelledby (references a DOM element).',
  };
}
