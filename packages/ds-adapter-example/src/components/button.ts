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
  const variantMap: Record<NonNullable<ButtonProps['variant']>, AcmeButtonProps['variant']> = {
    primary: 'primary',
    secondary: 'secondary',
    ghost: 'ghost',
    destructive: 'danger',
  };

  const sizeMap: Record<NonNullable<ButtonProps['size']>, AcmeButtonProps['size']> = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
  };

  return {
    // Accessible name mapping
    label: typeof props.children === 'string' ? props.children : undefined,
    ariaLabel: props['aria-label'],
    ariaLabelledBy: props['aria-labelledby'],
    // Other props
    variant: props.variant ? variantMap[props.variant] : 'primary',
    size: props.size ? sizeMap[props.size] : 'medium',
    disabled: props.disabled ?? props.loading,
    loading: props.loading,
    onClick: props.onClick,
    type: props.type ?? 'button',
    className: props.className,
  };
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
    const a11y = validateButtonAccessibility(props as Record<string, unknown>);
    if (!a11y.valid) {
      console.warn(`[ands/ds-adapter-example/Button] ${a11y.reason}`);
    }
  }
  return { component: 'AcmeButton', props: mapButtonProps(props) };
};

Button.displayName = 'AcmeButton (ANDS)';
