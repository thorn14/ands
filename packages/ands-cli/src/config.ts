/**
 * @module config
 * @description Loads the project-level `ands.config.ts` (or `.andsrc.json`).
 *
 * The config file is optional. If absent, ANDS runs with core patterns only.
 * Config is loaded once at CLI startup and passed to the registry builder.
 *
 * **Search order (first match wins):**
 * 1. `ands.config.ts`
 * 2. `ands.config.js`
 * 3. `.andsrc.json`
 */

import { pathToFileURL } from 'url';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { AndsConfig } from '@ands/contracts';

export type { AndsConfig };

const CONFIG_CANDIDATES = ['ands.config.ts', 'ands.config.js', '.andsrc.json'];

/**
 * Load the ANDS config from the current working directory.
 * Returns an empty config `{}` if no config file is found.
 * Throws with a descriptive message if the config file is malformed.
 */
export async function loadConfig(cwd = process.cwd()): Promise<AndsConfig> {
  for (const filename of CONFIG_CANDIDATES) {
    const filePath = join(cwd, filename);
    if (!existsSync(filePath)) continue;

    if (filename.endsWith('.json')) {
      try {
        const raw = readFileSync(filePath, 'utf8');
        return JSON.parse(raw) as AndsConfig;
      } catch (e) {
        throw new Error(
          `Failed to parse ${filename}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // TS/JS: dynamic import
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const mod = await import(fileUrl) as { default?: AndsConfig } | AndsConfig;
      const config = (mod as { default?: AndsConfig }).default ?? mod as AndsConfig;
      if (typeof config !== 'object' || config === null) {
        throw new Error(`${filename} must export a default object`);
      }
      return config;
    } catch (e) {
      throw new Error(
        `Failed to load ${filename}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  // No config file found — fine, return empty config
  return {};
}
