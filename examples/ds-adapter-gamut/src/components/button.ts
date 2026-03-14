/**
 * @module components/button
 * @description gamut-flavored Button satisfying ButtonContract.
 *
 * Uses gamut surface tokens via CSS variables:
 *   - Primary: var(--bg-brand) background, var(--fg-on-brand) text
 *   - Destructive: var(--bg-danger) background, var(--fg-on-danger) text
 *   - Ghost: transparent background, var(--fg-primary) text
 */

import type { ButtonProps, ButtonContract } from '@ands/foundation-primitives';
import { validateButtonAccessibility } from '@ands/foundation-primitives';

interface GamutButtonElement {
  component: 'GamutButton';
  props: {
    label?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    variant?: string;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: string;
    style: Record<string, string>;
  };
}

const VARIANT_STYLES: Record<string, Record<string, string>> = {
  primary: {
    background: 'var(--bg-brand)',
    color: 'var(--fg-on-brand)',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--fg-brand)',
    border: '1px solid var(--border-brand)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--fg-primary)',
    border: 'none',
  },
  destructive: {
    background: 'var(--bg-danger)',
    color: 'var(--fg-on-danger)',
    border: 'none',
  },
};

export const Button: ButtonContract = (props: ButtonProps): GamutButtonElement => {
  if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
    const a11y = validateButtonAccessibility(props as unknown as Record<string, unknown>);
    if (!a11y.valid) {
      console.warn(`[ands/ds-adapter-gamut/Button] ${a11y.reason}`);
    }
  }

  const variant = props.variant ?? 'primary';
  const hostVariant = variant === 'destructive' ? 'destructive' : variant;
  const style = VARIANT_STYLES[hostVariant] ?? VARIANT_STYLES['primary']!;

  return {
    component: 'GamutButton',
    props: {
      ...(typeof props.children === 'string' ? { label: props.children } : {}),
      ...(props['aria-label'] !== undefined ? { ariaLabel: props['aria-label'] } : {}),
      ...(props['aria-labelledby'] !== undefined ? { ariaLabelledBy: props['aria-labelledby'] } : {}),
      variant: hostVariant,
      ...(props.disabled !== undefined || props.loading !== undefined ? { disabled: props.disabled ?? props.loading } : {}),
      ...(props.loading !== undefined ? { loading: props.loading } : {}),
      ...(props.onClick !== undefined ? { onClick: props.onClick } : {}),
      type: props.type ?? 'button',
      style,
    },
  };
};

Button.displayName = 'GamutButton (ANDS)';
