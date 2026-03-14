/**
 * ANDS configuration for the gamut-form-example.
 *
 * This is how any project plugs into ANDS without modifying core packages:
 * 1. Import the plugin from your adapter
 * 2. Declare it here
 * 3. The CLI picks it up at startup — `ands run compliance` and `ands run test` become available
 *
 * No changes to ands-cli, interaction-kit, or contracts required.
 */

import { gamutPlugin } from '@ands/ds-adapter-gamut';
import type { AndsConfig } from '@ands/contracts';

export default {
  adapter: '@ands/ds-adapter-gamut',
  plugins: [gamutPlugin],
} satisfies AndsConfig;
