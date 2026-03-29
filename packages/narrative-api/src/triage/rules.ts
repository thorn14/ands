import type { TriageRule } from '@ands/contracts';

/**
 * Built-in deterministic triage rules for API field classification.
 *
 * These run before any LLM-based classification and provide instant,
 * reproducible results for common naming patterns.
 */
export const builtInTriageRules: TriageRule[] = [
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
  {
    pattern: /_password|_token|_secret/,
    triage: 'sensitive',
    reason: 'Field name contains a sensitive data indicator',
  },
  {
    pattern: /^(cost_|margin_|rate_)/,
    triage: 'sensitive',
    reason: 'Field name starts with a financial/sensitive prefix',
  },
  {
    pattern: /_at$|_date$|_time$/,
    triage: 'low',
    reason: 'Field name ends with a temporal suffix (typically metadata)',
  },
];
