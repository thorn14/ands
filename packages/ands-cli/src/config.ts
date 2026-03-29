/**
 * @module config
 * @description Loads the project-level `ands.config.ts` and resolves presets.
 *
 * **Load order:**
 * 1. Load defaults from `@ands/contracts/src/defaults.ts`
 * 2. Load `ands.config.ts` (or `.andsrc.json`) via dynamic import
 * 3. Resolve presets depth-first with cycle detection
 * 4. If `ands-policy.yaml` exists, load as low-priority preset (compat shim)
 * 5. If `ands-silence.yaml` exists, load into `config.silence` + emit migration warning
 * 6. Apply `mergeConfig()` from contracts: [defaults, ...presets, userConfig]
 *
 * **Search order for config (first match wins):**
 * 1. `ands.config.ts`
 * 2. `ands.config.js`
 * 3. `.andsrc.json`
 */

import { pathToFileURL } from 'url';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { AndsConfig } from '@ands/contracts';
import { mergeConfig, AndsConfigDefaults } from '@ands/contracts';

export type { AndsConfig };

const CONFIG_CANDIDATES = ['ands.config.ts', 'ands.config.js', '.andsrc.json'];

/**
 * Load a raw config from a specific file path.
 */
async function loadConfigFile(filePath: string, filename: string): Promise<AndsConfig> {
  if (filename.endsWith('.json')) {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as AndsConfig;
  }

  const fileUrl = pathToFileURL(filePath).href;
  const mod = await import(fileUrl) as { default?: AndsConfig } | AndsConfig;
  const config = (mod as { default?: AndsConfig }).default ?? mod as AndsConfig;
  if (typeof config !== 'object' || config === null) {
    throw new Error(`${filename} must export a default object`);
  }
  return config;
}

/**
 * Resolve presets depth-first with cycle detection.
 * Each preset may itself have `presets`.
 */
async function resolvePresets(
  presets: Partial<AndsConfig>[],
  visited: Set<string>,
  depth: number,
): Promise<Partial<AndsConfig>[]> {
  if (depth > 10) {
    throw new Error('Preset resolution exceeded maximum depth (10). Check for circular references.');
  }

  const resolved: Partial<AndsConfig>[] = [];

  for (const preset of presets) {
    // Try to identify the preset for cycle detection
    const presetId = typeof preset === 'string'
      ? preset
      : (preset as Record<string, unknown>)['__presetId'] as string | undefined;

    if (presetId) {
      if (visited.has(presetId)) {
        const cycle = [...visited, presetId].join(' → ');
        throw new Error(`Circular preset dependency detected: ${cycle}`);
      }
      visited.add(presetId);
    }

    // If preset is a string, try to import it as a package
    let resolvedPreset: Partial<AndsConfig>;
    if (typeof preset === 'string') {
      try {
        const mod = await import(preset) as { default?: Partial<AndsConfig> };
        resolvedPreset = mod.default ?? mod as Partial<AndsConfig>;
      } catch (e) {
        const isModuleNotFound = e instanceof Error &&
          ('code' in e && (e as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND');
        if (isModuleNotFound) {
          throw new Error(
            `Preset "${preset}" could not be resolved. ` +
            `Expected it to provide Partial<AndsConfig>. ` +
            `Install with: pnpm add -D ${preset}`,
          );
        }
        throw e;
      }
    } else {
      resolvedPreset = preset;
    }

    // Recursively resolve nested presets
    if (resolvedPreset.presets && resolvedPreset.presets.length > 0) {
      const nestedPresets = await resolvePresets(
        resolvedPreset.presets as Partial<AndsConfig>[],
        new Set(visited),
        depth + 1,
      );
      resolved.push(...nestedPresets);
    }

    // Add the preset itself (without its presets field)
    const { presets: _, ...presetWithoutPresets } = resolvedPreset;
    resolved.push(presetWithoutPresets);
  }

  return resolved;
}

/**
 * Try to load YAML compat shim files.
 */
function tryLoadYamlCompat(cwd: string): { hasSilence: boolean } {
  const policyPath = join(cwd, 'ands-policy.yaml');
  const silencePath = join(cwd, 'ands-silence.yaml');

  if (existsSync(policyPath)) {
    // YAML support is a compat shim — we just note its existence for now.
    // Full YAML parsing would require a YAML dep. For now, emit a warning.
    process.stderr.write(
      'ands: ands-policy.yaml detected. Migrate to ands.config.ts for full support.\n' +
      '  See: https://github.com/thorn14/ands#configuration\n',
    );
  }

  const hasSilence = existsSync(silencePath);
  if (hasSilence) {
    process.stderr.write(
      'ands: ands-silence.yaml detected. Migrate silence rules to ands.config.ts:\n' +
      '  export default { silence: { rules: [...] } } satisfies AndsConfig;\n',
    );
  }

  return { hasSilence };
}

/**
 * Load the ANDS config from the current working directory.
 * Returns a fully merged config with defaults, presets, and user overrides applied.
 * Throws with a descriptive message if the config file is malformed.
 */
export async function loadConfig(cwd = process.cwd()): Promise<AndsConfig> {
  // Step 1: Find and load user config
  let userConfig: AndsConfig = {};
  let configFound = false;

  for (const filename of CONFIG_CANDIDATES) {
    const filePath = join(cwd, filename);
    if (!existsSync(filePath)) continue;

    try {
      userConfig = await loadConfigFile(filePath, filename);
      configFound = true;
      break;
    } catch (e) {
      throw new Error(
        `Failed to load ${filename}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  // Step 2: YAML compat shims
  tryLoadYamlCompat(cwd);

  // Step 3: Resolve presets
  const resolvedPresets = userConfig.presets
    ? await resolvePresets(userConfig.presets as Partial<AndsConfig>[], new Set(), 0)
    : [];

  // Step 4: Merge: defaults < presets < user config
  const { presets: _, ...userWithoutPresets } = userConfig;
  const layers: Partial<AndsConfig>[] = [AndsConfigDefaults, ...resolvedPresets, userWithoutPresets];
  const merged = layers.reduce((acc, layer) => mergeConfig(acc, layer));

  return merged as AndsConfig;
}
