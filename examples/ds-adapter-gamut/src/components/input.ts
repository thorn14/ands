/**
 * @module components/input
 * @description gamut-flavored Input satisfying InputContract.
 *
 * Uses gamut surface tokens via CSS variables:
 *   - Background: var(--bg-surface)
 *   - Text: var(--fg-primary)
 *   - Border: var(--border-subtle)
 *   - Error: var(--fg-error)
 */

import type { InputProps, InputContract } from '@ands/foundation-primitives';
import { validateInputAccessibility } from '@ands/foundation-primitives';

interface GamutInputElement {
  component: 'GamutInput';
  props: {
    label?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    style: Record<string, string>;
  };
}

export const Input: InputContract = (props: InputProps): GamutInputElement => {
  if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
    const a11y = validateInputAccessibility(props as unknown as Record<string, unknown>);
    if (!a11y.valid) {
      console.warn(`[ands/ds-adapter-gamut/Input] ${a11y.reason}`);
    }
  }

  return {
    component: 'GamutInput',
    props: {
      ...(typeof props.label === 'string' ? { label: props.label } : {}),
      ...(props['aria-label'] !== undefined ? { ariaLabel: props['aria-label'] } : {}),
      ...(props['aria-labelledby'] !== undefined ? { ariaLabelledBy: props['aria-labelledby'] } : {}),
      type: props.type ?? 'text',
      ...(props.placeholder !== undefined ? { placeholder: props.placeholder } : {}),
      ...(props.disabled !== undefined ? { disabled: props.disabled } : {}),
      ...(props.readOnly !== undefined ? { readOnly: props.readOnly } : {}),
      style: {
        background: 'var(--bg-surface)',
        color: 'var(--fg-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-base)',
        padding: 'var(--spacing-2) var(--spacing-3)',
      },
    },
  };
};

Input.displayName = 'GamutInput (ANDS)';
