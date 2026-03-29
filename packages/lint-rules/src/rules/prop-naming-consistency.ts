/**
 * @module rules/prop-naming-consistency
 * @description Detects props that don't match the DS adapter's naming conventions.
 */

import type { AndsLintRule, AndsLintContext, AndsIssue } from '@ands/contracts';

export const propNamingConsistency: AndsLintRule = {
  name: 'prop-naming-consistency',
  description: 'Ensure prop names match DS adapter naming conventions',
  create(ctx: AndsLintContext): AndsIssue[] {
    const issues: AndsIssue[] = [];

    // Collect all prop conventions from adapters
    const conventions = new Map<string, Set<string>>();
    for (const adapter of ctx.adapters) {
      if (adapter.propConventions) {
        for (const [canonical, aliases] of Object.entries(adapter.propConventions)) {
          const existing = conventions.get(canonical) ?? new Set<string>();
          for (const alias of aliases) {
            existing.add(alias);
          }
          conventions.set(canonical, existing);
        }
      }
    }

    if (conventions.size === 0) return issues;

    // Build a set of all known valid prop names
    const validNames = new Set<string>();
    for (const [canonical, aliases] of conventions) {
      validNames.add(canonical);
      for (const alias of aliases) {
        validNames.add(alias);
      }
    }

    // Build reverse map: alias → canonical
    const aliasToCanonical = new Map<string, string>();
    for (const [canonical, aliases] of conventions) {
      for (const alias of aliases) {
        if (alias !== canonical) {
          aliasToCanonical.set(alias, canonical);
        }
      }
    }

    // Only check TSX/JSX files
    if (!ctx.filePath.endsWith('.tsx') && !ctx.filePath.endsWith('.jsx')) {
      return issues;
    }

    const lines = ctx.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      // Find prop assignments in JSX: propName={...} or propName="..."
      const propRe = /\b([a-zA-Z_]\w*)\s*=/g;
      let match: RegExpExecArray | null;
      while ((match = propRe.exec(line)) !== null) {
        const propName = match[1]!;
        const canonical = aliasToCanonical.get(propName);
        if (canonical && propName !== canonical) {
          issues.push({
            category: 'compliance',
            code: 'PROP_NAMING_INCONSISTENCY',
            message: `Prop "${propName}" should use canonical name "${canonical}" for consistency`,
            loc: { file: ctx.filePath, line: i + 1, col: match.index },
            suggestion: `Replace ${propName} with ${canonical}`,
            severity: 'warn',
          });
        }
      }
    }

    return issues;
  },
};
