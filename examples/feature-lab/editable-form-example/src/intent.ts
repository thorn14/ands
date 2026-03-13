/**
 * @module intent
 * @description Feature Lab proof — User Profile editable form.
 *
 * This is the **Feature Lab layer** — the most flexible tier.
 * It extends the `editable-form` Interaction Kit pattern with domain-specific
 * fields, then validates via `ands validate ./dist/intent.js`.
 *
 * **Portability proof:**
 * - Does NOT import preset primitives directly (uses ds-adapter-example instead)
 * - Extends Interaction Kit schema via standard TypeScript type assignment
 * - `ands validate` should exit with code 0 on this file (after compilation)
 *
 * **Boundary rule (Feature Lab — Flexible):**
 * - MAY import Interaction Kit (schema, state machine)
 * - MAY import ds-adapter-example (component wrappers)
 * - Must NOT modify core pattern files
 */

import type { EditableFormIntent } from '@ands/interaction-kit';

/**
 * User Profile form intent.
 *
 * Validate: ands validate ./dist/intent.js
 * Schema:   packages/interaction-kit/src/editable-form/schema.ts
 */
export const intent: EditableFormIntent = {
  kind: 'editable-form',
  id: 'user-profile-form',
  version: '1.0.0',
  description: 'Edit the current user\'s profile information',

  fields: [
    {
      id: 'full-name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Jane Smith',
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'jane@example.com',
      validation: {
        pattern: '^[^@]+@[^@]+\\.[^@]+$',
      },
    },
    {
      id: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: false,
      placeholder: '+1 (555) 000-0000',
    },
    {
      id: 'bio',
      label: 'Short Bio',
      type: 'textarea',
      required: false,
      placeholder: 'Tell us a little about yourself...',
      validation: {
        maxLength: 500,
      },
    },
    {
      id: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'viewer', label: 'Viewer' },
        { value: 'editor', label: 'Editor' },
        { value: 'admin', label: 'Administrator' },
      ],
    },
    {
      id: 'notifications',
      label: 'Email Notifications',
      type: 'checkbox',
      required: false,
      defaultValue: true,
    },
  ],

  logic: {
    onSuccess: 'toast',
    successMessage: 'Profile updated successfully.',
    onValidationError: 'scroll-to-field',
    onSubmitError: 'banner',
    requireConfirmation: false,
    resetOnSuccess: false,
    warnOnUnsavedChanges: true,
  },

  layout: {
    columns: 1,
    submitLabel: 'Save Profile',
    cancelLabel: 'Discard Changes',
    sections: [
      {
        id: 'personal',
        title: 'Personal Information',
        fieldIds: ['full-name', 'email', 'phone', 'bio'],
      },
      {
        id: 'account',
        title: 'Account Settings',
        fieldIds: ['role', 'notifications'],
      },
    ],
  },
};
