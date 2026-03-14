/**
 * Intent for user-profile form using gamut-all surface tokens.
 *
 * This is the portability proof for the gamut adapter:
 * - Same editable-form schema as any other adapter
 * - Styling uses gamut surface vars (var(--bg-surface), var(--fg-primary), etc.)
 * - `ands validate ./dist/intent.js` → exit 0
 * - `ands run compliance src/gamut-tokens.json` → exit 0
 *
 * The adapter (gamut) is declared in ands.config.ts — not imported here.
 * This intent file is adapter-agnostic.
 */

import type { EditableFormIntent } from '@ands/interaction-kit';
import { brand } from '@ands/contracts';
import type { IntentId, FieldId } from '@ands/contracts';

export const intent: EditableFormIntent = {
  kind: 'editable-form',
  id: brand<IntentId>('user-profile-form'),
  version: '1.0.0',
  description: 'User profile edit form — styled with gamut surface tokens',
  fields: [
    {
      id: brand<FieldId>('display-name'),
      label: 'Display Name',
      type: 'text',
      required: true,
      placeholder: 'Your name',
    },
    {
      id: brand<FieldId>('email'),
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'you@example.com',
    },
    {
      id: brand<FieldId>('bio'),
      label: 'Bio',
      type: 'textarea',
      required: false,
      placeholder: 'Tell us about yourself',
    },
  ],
  logic: {
    onSuccess: 'toast',
    successMessage: 'Profile updated.',
    onValidationError: 'scroll-to-field',
    onSubmitError: 'banner',
    requireConfirmation: false,
    resetOnSuccess: false,
    warnOnUnsavedChanges: true,
  },
  layout: {
    columns: 1,
    submitLabel: 'Save Profile',
    cancelLabel: 'Discard',
  },
};
