/**
 * @module narrative
 * @description Types for narrative (AI-assisted review) packages.
 *
 * Used by @ands/narrative-diff, @ands/narrative-browser, @ands/narrative-api.
 */

import type { AndsIssue } from './cli-output.js';

/** Provider for LLM-based narrative operations. */
export interface NarrativeProvider {
  name: string;
  description: string;
  generate: (prompt: string, context: NarrativeContext) => Promise<string>;
}

export interface NarrativeContext {
  config: unknown;
  model?: string;
}

/** Browser provider for automation-based narrative operations. */
export interface BrowserProvider {
  name: string;
  description: string;
  run: (flow: AndsFlow) => Promise<AndsIssue[]>;
}

/** A flow definition for browser-based testing. */
export interface AndsFlow {
  name: string;
  description?: string;
  steps: FlowStep[];
}

/** A single step in a browser flow. */
export interface FlowStep {
  action: 'navigate' | 'click' | 'fill' | 'assert' | 'snapshot' | 'wait' | 'extract';
  target?: string;
  value?: string;
  timeout?: number;
  description?: string;
}
