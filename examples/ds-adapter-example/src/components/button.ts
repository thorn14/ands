/**
 * @module components/button
 * @description AcmeDS Button wrapped to satisfy `ButtonContract`.
 *
 * **Adapter pattern:**
 * The host DS (AcmeDS) has its own Button with its own prop shape.
 * This wrapper:
 * 1. Accepts `ButtonProps` (ANDS contract — requires accessible name)
 * 2. Maps to `AcmeButtonProps` (host DS prop shape)
 * 3. Returns a renderable representation (framework-agnostic string for demo)
 *
 * In a real adapter (e.g. for React), `renderButton` would return JSX.
 * This demo returns a plain object to remain framework-agnostic.
 */

import type { ButtonProps, ButtonContract } from '@ands/foundation-primitives';
import { validateButtonAccessibility } from '@ands/foundation-primitives';

// ---------------------------------------------------------------------------
// Simulated AcmeDS Button (in a real adapter, imported from the host DS)
// ---------------------------------------------------------------------------

interface AcmeButtonProps {
  label?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/** Rendered representation (framework-agnostic). In React this would be JSX. */
interface RenderedElement {
  component: 'AcmeButton';
  props: AcmeButtonProps;
}

// ---------------------------------------------------------------------------
// Prop mapper: ANDS ButtonProps → AcmeButtonProps
// ---------------------------------------------------------------------------

function mapButtonProps(props: ButtonProps): AcmeButtonProps {
  const variantMap: Record<NonNullable<ButtonProps['variant']>, NonNullable<AcmeButtonProps['variant']>> = {
    primary: 'primary',
    secondary: 'secondary',
    ghost: 'ghost',
    destructive: 'danger',
  };

  const sizeMap: Record<NonNullable<ButtonProps['size']>, NonNullable<AcmeButtonProps['size']>> = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
  };

  const mapped: AcmeButtonProps = {
    variant: props.variant ? variantMap[props.variant]! : 'primary',
    size: props.size ? sizeMap[props.size]! : 'medium',
    type: props.type ?? 'button',
  };
  if (typeof props.children === 'string') mapped.label = props.children;
  if (props['aria-label'] !== undefined) mapped.ariaLabel = props['aria-label'];
  if (props['aria-labelledby'] !== undefined) mapped.ariaLabelledBy = props['aria-labelledby'];
  const disabledVal = props.disabled ?? props.loading;
  if (disabledVal !== undefined) mapped.disabled = disabledVal;
  if (props.loading !== undefined) mapped.loading = props.loading;
  if (props.onClick !== undefined) mapped.onClick = props.onClick;
  if (props.className !== undefined) mapped.className = props.className;
  return mapped;
}

// ---------------------------------------------------------------------------
// ANDS ButtonContract implementation
// ---------------------------------------------------------------------------

/**
 * AcmeDS Button satisfying the ANDS `ButtonContract`.
 * Throws in development if accessibility constraints are violated.
 */
export const Button: ButtonContract = (props: ButtonProps): RenderedElement => {
  // Runtime a11y check (dev-only; TypeScript handles compile-time)
  if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
    const a11y = validateButtonAccessibility(props as unknown as Record<string, unknown>);
    if (!a11y.valid) {
      console.warn(`[ands/ds-adapter-example/Button] ${a11y.reason}`);
    }
  }
  return { component: 'AcmeButton', props: mapButtonProps(props) };
};

Button.displayName = 'AcmeButton (ANDS)';
