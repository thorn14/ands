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
  const sizeMap: Record<NonNullable<InputProps['size']>, NonNullable<AcmeTextFieldProps['size']>> = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
  };

  const mapped: AcmeTextFieldProps = {
    name: props.name,
    inputType: props.type ?? 'text',
    size: props.size ? sizeMap[props.size]! : 'medium',
  };
  if ('label' in props) mapped.label = props.label;
  if (props['aria-label'] !== undefined) mapped.ariaLabel = props['aria-label'];
  if (props['aria-labelledby'] !== undefined) mapped.ariaLabelledBy = props['aria-labelledby'];
  if (props.placeholder !== undefined) mapped.placeholder = props.placeholder;
  if (props.value !== undefined) mapped.value = props.value;
  if (props.defaultValue !== undefined) mapped.defaultValue = props.defaultValue;
  if (props.required !== undefined) mapped.required = props.required;
  if (props.disabled !== undefined) mapped.disabled = props.disabled;
  if (props.readOnly !== undefined) mapped.readOnly = props.readOnly;
  if (props.error !== undefined) mapped.errorText = props.error;
  if (props.hint !== undefined) mapped.helperText = props.hint;
  if (props.className !== undefined) mapped.className = props.className;
  if (props.onChange !== undefined) mapped.onChange = (e) => props.onChange!(e.target.value);
  if (props.onBlur !== undefined) mapped.onBlur = props.onBlur;
  return mapped;
}

// ---------------------------------------------------------------------------
// ANDS InputContract implementation
// ---------------------------------------------------------------------------

/**
 * AcmeDS TextField satisfying the ANDS `InputContract`.
 */
export const Input: InputContract = (props: InputProps): RenderedElement => {
  if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
    const a11y = validateInputAccessibility(props as unknown as Record<string, unknown>);
    if (!a11y.valid) {
      console.warn(`[ands/ds-adapter-example/Input] ${a11y.reason}`);
    }
  }
  return { component: 'AcmeTextField', props: mapInputProps(props) };
};

Input.displayName = 'AcmeTextField (ANDS)';
