/**
 * @module defaults
 * @description Default values for every `AndsConfig` field.
 *
 * Used by `mergeConfig()` as the lowest-priority layer.
 * All values are conservative — existing consumers who don't set a field are unaffected.
 */

import type { AndsConfig } from './config.js';

export const AndsConfigDefaults: AndsConfig = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  adapters: [],
  plugins: [],
  presets: [],
  enforcement: {
    tokens: { mode: 'error' },
    a11y: {
      tier1: { enabled: true },
      tier2: { enabled: false },
      tier3: { enabled: false },
    },
    props: { mode: 'warn' },
    versioning: { mode: 'warn' },
  },
  mcp: {
    port: 3333,
    upstreams: [],
  },
};
