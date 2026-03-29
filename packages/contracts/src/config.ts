/**
 * @module config
 * @description AndsConfig — the single configuration interface for ANDS.
 *
 * All configuration lives in ands.config.ts in the project root.
 * Every new ANDS package adds optional fields here — no separate config files.
 */

import type { AndsAdapter } from './adapter.js';
import type { AndsPlugin } from './plugin.js';
import type { SilenceConfig } from './silence.js';

/** Exclude directive for filtering merged arrays. */
export interface ExcludeDirective {
  exclude: string;
}

/** MCP upstream server configuration. */
export interface McpUpstreamConfig {
  name: string;
  url: string;
  type: string;
  token_env?: string;
}

/** Token enforcement configuration. */
export interface TokenEnforcementConfig {
  mode?: 'error' | 'warn' | 'off';
}

/** A11y enforcement configuration. */
export interface A11yEnforcementConfig {
  tier1?: { enabled?: boolean };
  tier2?: { enabled?: boolean; url?: string };
  tier3?: { enabled?: boolean; url?: string; minScore?: number };
}

/** Prop enforcement configuration. */
export interface PropEnforcementConfig {
  mode?: 'error' | 'warn' | 'off';
}

/** Versioning enforcement configuration. */
export interface VersioningEnforcementConfig {
  mode?: 'error' | 'warn' | 'off';
}

/** Enforcement section of AndsConfig. */
export interface EnforcementConfig {
  tokens?: TokenEnforcementConfig;
  a11y?: A11yEnforcementConfig;
  props?: PropEnforcementConfig;
  versioning?: VersioningEnforcementConfig;
}

/** Browser provider configuration. */
export interface BrowserConfig {
  provider?: 'local' | 'browserbase' | 'browserless';
  browserbase_api_key_env?: string;
  browserless_url_env?: string;
}

/** Vision configuration. */
export interface VisionConfig {
  enabled?: boolean;
  baseline_dir?: string;
}

/** Narrative (AI-assisted review) configuration. */
export interface NarrativeConfig {
  provider?: string;
  model?: string;
  browser?: BrowserConfig;
  vision?: VisionConfig;
}

/** MCP server configuration. */
export interface McpConfig {
  port?: number;
  upstreams?: (McpUpstreamConfig | ExcludeDirective)[];
}

/** Council (human judgment escalation) configuration. */
export interface CouncilConfig {
  exceptionLedger?: string;
  councilLog?: string;
}

/**
 * Shape of the project-level `ands.config.ts` default export.
 *
 * The CLI looks for this file in `process.cwd()` at startup.
 * If absent, ANDS runs with core patterns only (no plugins).
 */
export interface AndsConfig {
  /** Glob patterns for source files to scan. */
  content?: string[];
  /** Path to guidelines directory. */
  guidelines?: string;
  /** Path to docs output directory. */
  docs?: string;
  /** Silence configuration for suppressing known issues. */
  silence?: SilenceConfig;
  /** DS adapters — string package names or inline AndsAdapter objects. */
  adapters?: (string | AndsAdapter | ExcludeDirective)[];
  /** Default adapter package name (used in scaffold --adapter default). */
  adapter?: string;
  /** Enforcement configuration. */
  enforcement?: EnforcementConfig;
  /** Narrative (AI-assisted review) configuration. */
  narrative?: NarrativeConfig;
  /** MCP server configuration. */
  mcp?: McpConfig;
  /** Council (human judgment) configuration. */
  council?: CouncilConfig;
  /** Plugins to load at CLI startup. */
  plugins?: (AndsPlugin | ExcludeDirective)[];
  /** Preset configs to merge (depth-first, defaults < presets < consumer). */
  presets?: Partial<AndsConfig>[];
}
