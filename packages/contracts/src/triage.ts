/**
 * @module triage
 * @description Types for API surface triage.
 *
 * Used by @ands/narrative-api for deterministic pre-scoring + LLM classification.
 */

import type { TriageLevel } from './cli-output.js';

/** A rule for deterministic pre-scoring of API fields. */
export interface TriageRule {
  /** Regex pattern to match against field names. */
  pattern: RegExp;
  /** Triage level to assign when matched. */
  triage: TriageLevel;
  /** Optional reason for the classification. */
  reason?: string;
}

/** Context passed to the triage system. */
export interface TriageContext {
  config: unknown;
  fields: TriageField[];
}

/** A field extracted from an API response for triage. */
export interface TriageField {
  name: string;
  type: string;
  rendered: boolean;
  value?: unknown;
}

/** Result of triaging a single field. */
export interface TriageResult {
  field: string;
  level: TriageLevel;
  reason: string;
  confidence: 'certain' | 'high' | 'medium' | 'low';
  source: 'rule' | 'llm';
}
