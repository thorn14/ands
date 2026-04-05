/**
 * @module resolve-peer
 * @description Utilities for gracefully resolving optional peer dependencies.
 */

import type { AndsIssue } from '@ands/contracts';

/**
 * Attempt to dynamically import an optional peer dependency.
 * Returns null if the package is not installed.
 */
export async function tryImport<T>(pkg: string): Promise<T | null> {
  try {
    return await import(pkg) as T;
  } catch {
    return null;
  }
}

/**
 * Create an info-level issue indicating a peer dependency is not installed.
 */
export function peerNotInstalledIssue(code: string, pkg: string, installCmd: string): AndsIssue {
  return {
    category: 'compliance',
    code,
    message: `${pkg} not installed. Install: ${installCmd}`,
    severity: 'info',
    suggestion: installCmd,
  };
}
