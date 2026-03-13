/**
 * @module components/input
 * @description AcmeDS Input wrapped to satisfy `InputContract`.
 *
 * Maps ANDS `InputProps` → `AcmeTextFieldProps`.
 * Demonstrates the accessible name strategy:
 *  - `label` prop → AcmeTextField renders a `<label>` element
 *  - `aria-label` → passed through to the input element
 *  - `aria-labelledby` → passed through to the input element
 */

import type { InputProps, InputContract } from '@ands/foundation-primitives';
import { validateInputAccessibility } from '@ands/foundation-primitives';

// ---------------------------------------------------------------------------
// Simulated AcmeDS TextField
// ---------------------------------------------------------------------------

interface AcmeTextFieldProps {
  name: string;
  inputType?: string;
  label?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  errorText?: string;
  helperText?: string;
  className?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onBlur?: () => void;
}

interface RenderedElement {
  component: 'AcmeTextField';
  props: AcmeTextFieldProps;
}

// ---------------------------------------------------------------------------
// Prop mapper: ANDS InputProps → AcmeTextFieldProps
// ---------------------------------------------------------------------------

function mapInputProps(props: InputProps): AcmeTextFieldProps {
  const sizeMap: Record<NonNullable<InputProps['size']>, AcmeTextFieldProps['size']> = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
  };

  return {
    name: props.name,
    inputType: props.type ?? 'text',
    label: 'label' in props ? props.label : undefined,
    ariaLabel: props['aria-label'],
    ariaLabelledBy: props['aria-labelledby'],
    placeholder: props.placeholder,
    value: props.value,
    defaultValue: props.defaultValue,
    required: props.required,
    disabled: props.disabled,
    readOnly: props.readOnly,
    size: props.size ? sizeMap[props.size] : 'medium',
    errorText: props.error,
    helperText: props.hint,
    className: props.className,
    onChange: props.onChange
      ? (e) => props.onChange!(e.target.value)
      : undefined,
    onBlur: props.onBlur,
  };
}

// ---------------------------------------------------------------------------
// ANDS InputContract implementation
// ---------------------------------------------------------------------------

/**
 * AcmeDS TextField satisfying the ANDS `InputContract`.
 */
export const Input: InputContract = (props: InputProps): RenderedElement => {
  if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
    const a11y = validateInputAccessibility(props as Record<string, unknown>);
    if (!a11y.valid) {
      console.warn(`[ands/ds-adapter-example/Input] ${a11y.reason}`);
    }
  }
  return { component: 'AcmeTextField', props: mapInputProps(props) };
};

Input.displayName = 'AcmeTextField (ANDS)';
