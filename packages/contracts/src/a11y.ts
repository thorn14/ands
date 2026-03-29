/**
 * @module a11y
 * @description `A11yRunner` and `A11yRunConfig` — contracts for a11y testing plugins.
 *
 * Runners are registered via `AndsPlugin.a11yRunners` and executed by `ands run a11y`.
 * Three tiers: static (jsx-a11y), rendered (axe-core), page (lighthouse/pa11y).
 */

import type { AndsIssue } from './cli-output.js';
import type { AndsConfig } from './config.js';

/** Tier of a11y testing. */
export type A11yTier = 'static' | 'rendered' | 'page';

/** Configuration for running a11y tests. */
export interface A11yRunConfig {
  /** The fully resolved ANDS configuration. */
  config: AndsConfig;
  /** Which tier to run. If omitted, run all registered tiers. */
  tier?: A11yTier;
  /** URL to test against (for rendered and page tiers). */
  url?: string;
  /** Glob patterns for files to test (for static tier). */
  files?: string[];
}

/** An a11y runner contributed by a plugin. */
export interface A11yRunner {
  /** Runner name (e.g. 'jsx-a11y', 'axe-core', 'lighthouse'). */
  name: string;
  /** Which tier this runner implements. */
  tier: A11yTier;
  /** One-line description. */
  description: string;
  /** Execute the runner. Return issues for violations. */
  run: (config: A11yRunConfig) => Promise<AndsIssue[]>;
}
