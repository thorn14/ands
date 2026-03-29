/**
 * @module silence
 * @description `SilenceConfig` — configuration for suppressing known issues.
 *
 * Silence rules allow teams to acknowledge and suppress known violations
 * (e.g. internal API fields, legacy patterns) without failing CI.
 */

export interface SilenceRule {
  /** Pattern or code to match against issue codes. */
  code: string;
  /** Reason for suppression. Required for permanent silences. */
  reason?: string;
  /** ISO date string when this silence expires. Null for permanent. */
  expires?: string | null;
  /** Reference to a council decision (required for critical silences). */
  council_ref?: string;
  /** Triage level of the silenced issue. */
  triage?: 'critical' | 'notable' | 'low' | 'internal' | 'sensitive';
}

export interface SilenceConfig {
  /** Silence rules keyed by a descriptive name. */
  rules?: SilenceRule[];
}
