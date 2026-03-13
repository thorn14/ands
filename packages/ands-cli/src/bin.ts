#!/usr/bin/env node
/**
 * ANDS CLI binary entry point.
 *
 * Production: `node dist/bin.js` (after `pnpm build`)
 * Development: `tsx src/bin.ts` or `pnpm dev`
 *
 * To support TypeScript intent files (.ts), run via tsx:
 *   tsx src/bin.ts validate ./src/intent.ts
 */
import { runCli } from './cli.js';

void runCli(process.argv.slice(2));
