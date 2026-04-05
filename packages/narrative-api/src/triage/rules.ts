import type { TriageRule } from '@ands/contracts';

/**
 * Built-in deterministic triage rules for API field classification.
 *
 * These run before any LLM-based classification and provide instant,
 * reproducible results for common naming patterns.
 */
export const builtInTriageRules: TriageRule[] = [
  // PII rules first (higher priority than structural rules)
  // PII: SSN / national ID (critical)
  {
    pattern: /ssn|social_security|national_id/,
    triage: 'critical',
    reason: 'Field name suggests SSN or national ID (critical PII)',
  },
  // PII: credit card (critical)
  {
    pattern: /credit_card|card_number|cvv/,
    triage: 'critical',
    reason: 'Field name suggests credit card data (critical PII)',
  },
  // PII: email
  {
    pattern: /email|e_mail|user_email/,
    triage: 'sensitive',
    reason: 'Field name suggests email PII',
  },
  // PII: phone
  {
    pattern: /phone|mobile|cell/,
    triage: 'sensitive',
    reason: 'Field name suggests phone number PII',
  },
  // PII: address
  {
    pattern: /address|street|zip|postal/,
    triage: 'sensitive',
    reason: 'Field name suggests physical address PII',
  },
  // PII: date of birth
  {
    pattern: /dob|birth_date|date_of_birth/,
    triage: 'sensitive',
    reason: 'Field name suggests date of birth PII',
  },
  // Auth / secret fields
  {
    pattern: /_password|_token|_secret/,
    triage: 'sensitive',
    reason: 'Field name contains a sensitive data indicator',
  },
  // Financial fields
  {
    pattern: /^(cost_|margin_|rate_)/,
    triage: 'sensitive',
    reason: 'Field name starts with a financial/sensitive prefix',
  },
  // Structural / internal fields
  {
    pattern: /_id|_code|_key|_ref|_hash$/,
    triage: 'internal',
    reason: 'Field name ends with an internal identifier suffix',
  },
  {
    pattern: /^(internal_|raw_|legacy_)/,
    triage: 'internal',
    reason: 'Field name starts with an internal/raw/legacy prefix',
  },
  // Temporal fields (lowest priority)
  {
    pattern: /_at$|_date$|_time$/,
    triage: 'low',
    reason: 'Field name ends with a temporal suffix (typically metadata)',
  },
];
