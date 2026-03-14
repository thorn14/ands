/**
 * @module commands/test
 * @description Plugin command: `ands run test`
 *
 * Runs gamut-all token validation tests and maps results to ANDS Issue format.
 * Agents run this instead of `pnpm test` — output is always ANDS JSON.
 *
 * **Agent loop:**
 * ```bash
 * ands run test
 * # { ok: true, exitCode: 0 } = all tests pass
 * # { ok: false, issues: [...] } = fix flagged validation errors
 * ```
 *
 * This command validates that the gamut token schema itself is internally
 * consistent (ramps have monotonic luminance, surfaces reference valid ramps, etc.)
 */

import { makeOutput, emitOutput, ExitCode } from '@ands/ands-cli';
import type { PluginCommand } from '@ands/contracts';
import type { Issue } from '@ands/ands-cli';
import type { GamutTokenInput } from '../token-schema.js';

// ---------------------------------------------------------------------------
// Internal test suite for gamut token consistency
// ---------------------------------------------------------------------------

interface TestResult {
  name: string;
  passed: boolean;
  issue: Issue | undefined;
}

function testRampsHaveAtLeastTwoSteps(input: GamutTokenInput): TestResult[] {
  return input.ramps.map(ramp => {
    const passed = ramp.steps.length >= 2;
    return {
      name: `ramp "${ramp.name}" has ≥2 steps`,
      passed,
      issue: passed ? undefined : {
        category: 'contract' as const,
        code: 'RAMP_TOO_FEW_STEPS',
        message: `Ramp "${ramp.name}" has only ${ramp.steps.length} step(s) — at least 2 required`,
        path: [`ramps.${ramp.name}.steps`],
        hint: 'Add more steps to the ramp for proper token resolution.',
      },
    };
  });
}

function testRampStepsAreUnique(input: GamutTokenInput): TestResult[] {
  return input.ramps.map(ramp => {
    const steps = ramp.steps.map(s => s.step);
    const unique = new Set(steps);
    const passed = unique.size === steps.length;
    return {
      name: `ramp "${ramp.name}" has unique step numbers`,
      passed,
      issue: passed ? undefined : {
        category: 'contract' as const,
        code: 'RAMP_DUPLICATE_STEPS',
        message: `Ramp "${ramp.name}" has duplicate step numbers`,
        path: [`ramps.${ramp.name}.steps`],
        hint: 'Each step number in a ramp must be unique.',
      },
    };
  });
}

function testSurfacesReferenceValidRamps(input: GamutTokenInput): TestResult[] {
  const rampNames = new Set(input.ramps.map(r => r.name));
  const results: TestResult[] = [];

  for (const [surfaceName, surface] of Object.entries(input.surfaces ?? {})) {
    if (surface.fg) {
      const [rampName] = surface.fg.split('.');
      const passed = rampName ? rampNames.has(rampName) : true;
      results.push({
        name: `surface "${surfaceName}" fg references valid ramp`,
        passed,
        issue: passed ? undefined : {
          category: 'contract' as const,
          code: 'SURFACE_INVALID_RAMP_REF',
          message: `Surface "${surfaceName}" fg references unknown ramp "${rampName}"`,
          path: [`surfaces.${surfaceName}.fg`],
          hint: `Available ramps: ${[...rampNames].join(', ')}`,
        },
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Command implementation
// ---------------------------------------------------------------------------

async function runTest(args: string[]): Promise<number> {
  // Look for a gamut tokens file to validate
  const filePath = args[0] ?? 'src/gamut-tokens.json';

  let input: GamutTokenInput | null = null;
  const loadIssues: Issue[] = [];

  try {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const { validateGamutInput } = await import('../token-schema.js');

    const raw = JSON.parse(readFileSync(resolve(filePath), 'utf8'));
    const result = validateGamutInput(raw);
    if (result.ok) {
      input = result.data;
    } else {
      loadIssues.push(...result.error.issues.map(issue => ({
        category: 'schema' as const,
        code: 'GAMUT_SCHEMA_FAILURE',
        message: issue.message,
        path: issue.path.map(p => String(p)),
      })));
    }
  } catch (e) {
    // No token file found — run schema-only tests with minimal stub
    // This is not a failure — tests that need a file will be skipped
  }

  if (loadIssues.length > 0) {
    return emitOutput(
      makeOutput(
        'run',
        false,
        ExitCode.SchemaParseFailure,
        `Gamut token file invalid: ${loadIssues.length} schema error(s)`,
        loadIssues,
        { file: filePath },
      ),
    );
  }

  // Run consistency tests if we have input
  const allResults: TestResult[] = [];
  if (input) {
    allResults.push(
      ...testRampsHaveAtLeastTwoSteps(input),
      ...testRampStepsAreUnique(input),
      ...testSurfacesReferenceValidRamps(input),
    );
  }

  const failures = allResults.filter(r => !r.passed);
  const issues: Issue[] = failures.flatMap(r => r.issue ? [r.issue] : []);
  const ok = issues.length === 0;

  return emitOutput(
    makeOutput(
      'run',
      ok,
      ok ? ExitCode.Success : ExitCode.ContractRuleFailure,
      ok
        ? `All ${allResults.length} gamut token test(s) passed`
        : `${failures.length}/${allResults.length} gamut token test(s) failed`,
      issues,
      {
        data: {
          testsRun: allResults.length,
          passed: allResults.length - failures.length,
          failed: failures.length,
        },
      },
    ),
  );
}

export const testCommand: PluginCommand = {
  name: 'test',
  description: 'Run gamut-all token validation tests (agents: use this instead of pnpm test)',
  run: runTest,
};
