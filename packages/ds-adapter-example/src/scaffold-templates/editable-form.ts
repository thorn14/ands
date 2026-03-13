/**
 * @module scaffold-templates/editable-form
 * @description AcmeDS-specific scaffold template for the editable-form pattern.
 *
 * When `ands scaffold --pattern editable-form --adapter @ands/ds-adapter-example` is run,
 * the scaffolded files import AcmeDS components via this adapter.
 *
 * This module also demonstrates how a Feature Lab implementation would use
 * the adapter to render an editable form.
 */

import type { EditableFormIntent } from '@ands/interaction-kit';
import type { FieldDefinition } from '@ands/interaction-kit';
import { Button } from '../components/button.js';
import { Input } from '../components/input.js';
import { tokenVar } from '../token-map.js';

// ---------------------------------------------------------------------------
// Form renderer (adapter-provided, framework-agnostic demo)
// ---------------------------------------------------------------------------

export interface RenderedForm {
  fields: RenderedField[];
  submitButton: ReturnType<typeof Button>;
  cancelButton?: ReturnType<typeof Button>;
  styles: Record<string, string>;
}

export interface RenderedField {
  id: string;
  element: ReturnType<typeof Input>;
}

/**
 * Render an editable form intent into AcmeDS components.
 * This is the adapter's rendering bridge — it translates an
 * abstract intent into concrete DS components.
 *
 * Feature Lab components call this instead of rendering directly.
 */
export function renderEditableForm(intent: EditableFormIntent): RenderedForm {
  const fields = intent.fields.map(field => renderField(field));

  const submitButton = Button({
    children: intent.layout?.submitLabel ?? 'Save',
    type: 'submit',
    variant: 'primary',
  });

  const cancelButton = intent.layout?.cancelLabel
    ? Button({
        children: intent.layout.cancelLabel,
        type: 'button',
        variant: 'ghost',
      })
    : undefined;

  return {
    fields,
    submitButton,
    cancelButton,
    styles: buildFormStyles(intent),
  };
}

function renderField(field: FieldDefinition): RenderedField {
  const element = Input({
    label: field.label,
    name: field.id,
    type: field.type === 'textarea' ? 'text' : (field.type as 'text'),
    required: field.required,
    placeholder: field.placeholder,
    defaultValue:
      typeof field.defaultValue === 'string' ? field.defaultValue : undefined,
  });

  return { id: field.id, element };
}

function buildFormStyles(intent: EditableFormIntent): Record<string, string> {
  return {
    '--form-bg': tokenVar('color.neutral.0'),
    '--form-gap': tokenVar('spacing.4'),
    '--form-padding': tokenVar('spacing.6'),
    '--form-radius': tokenVar('border.radius.lg'),
    '--form-shadow': tokenVar('shadow.base'),
    '--form-error-color': tokenVar('color.semantic.error'),
    '--form-columns': String(intent.layout?.columns ?? 1),
  };
}
