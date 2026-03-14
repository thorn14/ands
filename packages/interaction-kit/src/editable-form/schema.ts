/**
 * @module editable-form/schema
 * @description Zod-based Interaction Schema for the Editable Form pattern.
 *
 * **Agent start here** for implementing an editable form feature.
 * Read this schema to understand exactly what an intent object must look like.
 * Then run `ands validate <your-intent-file.js>` to verify.
 *
 * The schema separates:
 *  - `fields[]`  — what data is collected (serializable, CLI-validatable)
 *  - `logic`     — how the form behaves on events (outcomes, not UI specifics)
 *  - `layout`    — optional progressive-disclosure hints for the UI layer
 *
 * **Extending this schema** (Feature Lab):
 * ```ts
 * import { editableFormIntentSchema } from '@ands/interaction-kit';
 * const mySchema = editableFormIntentSchema.extend({ myField: z.string() });
 * ```
 *
 * **Boundary rule (Interaction Kit — Structural):**
 * This file imports Foundation only. It must NOT import Feature Lab.
 */

import { z } from 'zod';
import { strictObject, identifier, nonEmptyString } from '@ands/contracts';

// ---------------------------------------------------------------------------
// Field types
// ---------------------------------------------------------------------------

export const FIELD_TYPES = [
  'text',
  'email',
  'password',
  'number',
  'tel',
  'url',
  'textarea',
  'select',
  'multiselect',
  'checkbox',
  'radio',
  'date',
  'file',
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

// ---------------------------------------------------------------------------
// Field definition schema
// ---------------------------------------------------------------------------

/**
 * A single field in the form.
 * Agents: add fields to the `fields` array in your intent.
 */
export const fieldSchema = strictObject({
  /** Unique field identifier within this form. E.g. "user-email" */
  id: identifier,
  /** Display label shown to the user. */
  label: nonEmptyString,
  /** HTML input type equivalent. */
  type: z.enum(FIELD_TYPES),
  /** Whether the field is required for submission. @default false */
  required: z.boolean().default(false),
  /** Placeholder text (not a substitute for label). */
  placeholder: z.string().optional(),
  /** Default value (scalar). */
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  /**
   * Options for select/multiselect/radio fields.
   * Must be provided when type is 'select', 'multiselect', or 'radio'.
   */
  options: z
    .array(
      strictObject({
        value: z.union([z.string(), z.number()]),
        label: nonEmptyString,
        disabled: z.boolean().optional(),
      }),
    )
    .optional(),
  /**
   * Validation rules applied client-side before submission.
   * Agents: use these to encode business rules in the intent.
   */
  validation: strictObject({
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(), // regex pattern string
    custom: z.string().optional(), // free-text description for adapter-specific validation
  }).optional(),
  /** Whether the field is visible in the initial (non-editing) view. Defaults to true when absent. */
  visibleInView: z.boolean().optional(),
  /** Whether the field is editable. Defaults to true when absent. */
  editable: z.boolean().optional(),
}).superRefine((data, ctx) => {
  const optionTypes: readonly string[] = ['select', 'multiselect', 'radio'];
  if (optionTypes.includes(data.type)) {
    if (!Array.isArray(data.options) || data.options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `options is required and must have at least one item when type is "${data.type}".`,
      });
    }
  }
});

export type FieldDefinition = z.infer<typeof fieldSchema>;

// ---------------------------------------------------------------------------
// Logic schema — WHAT happens, not HOW
// ---------------------------------------------------------------------------

/**
 * Defines form behavior outcomes without specifying UI implementation.
 * Adapters decide HOW to implement each outcome using host DS components.
 */
export const formLogicSchema = strictObject({
  /**
   * What to do when the form is successfully submitted.
   * 'toast'    — show a success notification (adapter provides the component)
   * 'redirect' — navigate to `successRedirectPath`
   * 'inline'   — show inline success state within the form
   * 'none'     — no automatic action (caller handles it)
   */
  onSuccess: z.enum(['toast', 'redirect', 'inline', 'none']),
  /** Required when onSuccess is 'redirect'. */
  successRedirectPath: z.string().optional(),
  /** Toast message shown when onSuccess is 'toast'. */
  successMessage: z.string().optional(),

  /**
   * What to do when client-side validation fails.
   * 'scroll-to-field' — scroll viewport to the first errored field
   * 'toast'           — show an error toast listing failures
   * 'inline'          — show error messages inline below each field (default)
   * 'none'            — no automatic action
   */
  onValidationError: z.enum(['scroll-to-field', 'toast', 'inline', 'none']),

  /**
   * What to do when the server/API returns an error on submit.
   * 'toast'  — show an error toast with the error message
   * 'banner' — show an error banner at the top of the form
   * 'inline' — adapter maps server error fields to form fields
   * 'none'   — no automatic action
   */
  onSubmitError: z.enum(['toast', 'banner', 'inline', 'none']),

  /**
   * Whether to show a confirmation dialog before submitting.
   * @default false
   */
  requireConfirmation: z.boolean().default(false),
  /** Confirmation dialog message. Required when requireConfirmation is true. */
  confirmationMessage: z.string().optional(),

  /**
   * Whether to reset the form after successful submission.
   * @default false
   */
  resetOnSuccess: z.boolean().default(false),

  /**
   * Whether to warn the user if they try to navigate away with unsaved changes.
   * @default true
   */
  warnOnUnsavedChanges: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.onSuccess === 'redirect') {
    const path = data.successRedirectPath;
    if (typeof path !== 'string' || path.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['successRedirectPath'],
        message: 'successRedirectPath is required when onSuccess is "redirect".',
      });
    }
  }
  if (data.requireConfirmation === true) {
    const msg = data.confirmationMessage;
    if (typeof msg !== 'string' || msg.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmationMessage'],
        message: 'confirmationMessage is required when requireConfirmation is true.',
      });
    }
  }
});

export type FormLogic = z.infer<typeof formLogicSchema>;

// ---------------------------------------------------------------------------
// Layout hints (optional, progressive disclosure)
// ---------------------------------------------------------------------------

export const formLayoutSchema = strictObject({
  /**
   * Number of columns for the field grid.
   * @default 1
   */
  columns: z.number().int().min(1).max(4).default(1),
  /**
   * Whether to group fields using sections.
   * Sections are purely visual; logic uses field IDs directly.
   */
  sections: z
    .array(
      strictObject({
        id: identifier,
        title: z.string().optional(),
        fieldIds: z.array(identifier),
      }),
    )
    .optional(),
  /**
   * Submit button label.
   * @default 'Save'
   */
  submitLabel: z.string().default('Save'),
  /**
   * Cancel/discard button label. When provided, a cancel button is rendered.
   */
  cancelLabel: z.string().optional(),
}).optional();

export type FormLayout = z.infer<typeof formLayoutSchema>;

// ---------------------------------------------------------------------------
// Top-level Editable Form Intent Schema
// ---------------------------------------------------------------------------

/**
 * The complete intent schema for the editable-form pattern.
 *
 * **Agents:** export an object matching this shape from your intent file.
 *
 * ```ts
 * // src/intent.ts
 * import type { EditableFormIntent } from '@ands/interaction-kit';
 *
 * export const intent: EditableFormIntent = {
 *   kind: 'editable-form',
 *   id: 'user-profile-form',
 *   version: '1.0.0',
 *   fields: [
 *     { id: 'full-name', label: 'Full Name', type: 'text', required: true },
 *     { id: 'email', label: 'Email', type: 'email', required: true },
 *   ],
 *   logic: {
 *     onSuccess: 'toast',
 *     successMessage: 'Profile updated.',
 *     onValidationError: 'scroll-to-field',
 *     onSubmitError: 'banner',
 *   },
 * };
 * ```
 */
export const editableFormIntentSchema = strictObject({
  /**
   * Discriminant — identifies this as an editable-form intent.
   * The ANDS CLI uses this to select the correct schema for validation.
   */
  kind: z.literal('editable-form'),

  /**
   * Unique identifier for this form instance.
   * Must be a lowercase slug (e.g. "user-profile-form").
   */
  id: identifier,

  /**
   * Semantic version of this intent definition.
   * Increment when making breaking changes to fields or logic.
   */
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be semver (e.g. 1.0.0)'),

  /**
   * Human-readable description of what this form does.
   * Used in CLI output and manifests.
   */
  description: z.string().optional(),

  /** Field definitions. Must contain at least one field. */
  fields: z.array(fieldSchema).min(1, 'At least one field is required'),

  /**
   * Form behavior logic — what happens on submit, error, etc.
   * This is REQUIRED. Adapters use it to wire up side effects.
   */
  logic: formLogicSchema,

  /**
   * Optional layout hints for the adapter's renderer.
   * When omitted, the adapter uses its defaults.
   */
  layout: formLayoutSchema,
});

export type EditableFormIntent = z.infer<typeof editableFormIntentSchema>;
