/**
 * @module rules/no-hardcoded-string
 * @description Lint rule: detect hardcoded user-facing strings in JSX/TSX that should use translation functions.
 *
 * Uses OXC parser for AST-based detection. Flags:
 * - JSXText with non-trivial content
 * - String literal JSXAttributeValues on user-facing attributes
 * - Strings not wrapped in configured translation function calls
 */

import type { AndsLintRule, AndsLintContext, AndsIssue, AndsConfig } from '@ands/contracts';
import { createRequire } from 'node:module';

// Default translation function names
const DEFAULT_TRANSLATION_FNS = ['t', 'i18n.t', 'formatMessage', 'intl.formatMessage'];

// Attributes that contain user-facing text
const DEFAULT_CHECK_ATTRS = ['title', 'placeholder', 'label', 'alt', 'aria-label', 'aria-description'];

// Attributes to skip (never user-facing)
const SKIP_ATTRS = new Set([
  'className', 'class', 'data-testid', 'href', 'src', 'type', 'role', 'key', 'id',
  'name', 'htmlFor', 'for', 'rel', 'target', 'method', 'action', 'encoding',
  'data-cy', 'data-test',
]);

// Patterns that are not user-facing strings
function isNonTranslatable(str: string): boolean {
  const trimmed = str.trim();
  if (trimmed.length < 3) return true;
  // Pure numbers
  if (/^\d+(\.\d+)?$/.test(trimmed)) return true;
  // camelCase identifiers
  if (/^[a-z][a-zA-Z0-9]*$/.test(trimmed)) return true;
  // SCREAMING_CASE constants
  if (/^[A-Z][A-Z0-9_]*$/.test(trimmed)) return true;
  // kebab-case (CSS classes, etc.)
  if (/^[a-z][a-z0-9-]*$/.test(trimmed)) return true;
  // URL-like
  if (/^https?:\/\//.test(trimmed) || /^\/[a-z]/.test(trimmed)) return true;
  // Interpolation-only
  if (/^\{.*\}$/.test(trimmed)) return true;
  return false;
}

interface OxcNode {
  type: string;
  span?: { start: number; end: number };
  name?: string | OxcNode;
  value?: string | OxcNode;
  attributes?: OxcNode[];
  children?: OxcNode[];
  openingElement?: OxcNode;
  expression?: OxcNode;
  callee?: OxcNode;
  object?: OxcNode;
  property?: OxcNode;
  [key: string]: unknown;
}

function getAttrName(attr: OxcNode): string | null {
  if (attr.type !== 'JSXAttribute') return null;
  const nameNode = attr.name;
  if (typeof nameNode === 'string') return nameNode;
  if (nameNode && typeof nameNode === 'object') {
    if ('name' in nameNode && typeof nameNode.name === 'string') return nameNode.name;
    if (nameNode.type === 'JSXNamespacedName') {
      const ns = (nameNode as any).namespace;
      const local = (nameNode as any).name;
      const nsName = typeof ns === 'string' ? ns : ns?.name ?? '';
      const localName = typeof local === 'string' ? local : local?.name ?? '';
      return `${nsName}:${localName}`;
    }
  }
  return null;
}

function getAttrStringValue(attr: OxcNode): string | null {
  const val = attr.value;
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.type === 'StringLiteral' && typeof val.value === 'string') return val.value;
  return null;
}

function walkAst(node: OxcNode, visitor: (n: OxcNode) => void): void {
  visitor(node);
  for (const key of Object.keys(node)) {
    const child = (node as any)[key];
    if (child && typeof child === 'object') {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && item.type) {
            walkAst(item, visitor);
          }
        }
      } else if (child.type) {
        walkAst(child, visitor);
      }
    }
  }
}

function getLineFromOffset(content: string, offset: number): number {
  return content.slice(0, offset).split('\n').length;
}

export const noHardcodedString: AndsLintRule = {
  name: 'no-hardcoded-string',
  description: 'Detect hardcoded user-facing strings that should use translation functions',
  create(ctx: AndsLintContext): AndsIssue[] {
    // Only check JSX/TSX files
    if (!ctx.filePath.endsWith('.tsx') && !ctx.filePath.endsWith('.jsx')) return [];

    const config = ctx.config as AndsConfig;
    const i18nConfig = config.i18n;
    if (i18nConfig?.mode === 'off') return [];

    const severity = i18nConfig?.mode === 'error' ? 'error' : 'warn';
    const checkAttrs = new Set(i18nConfig?.checkAttributes ?? DEFAULT_CHECK_ATTRS);
    const translationFns = new Set(i18nConfig?.translationFunctions ?? DEFAULT_TRANSLATION_FNS);
    const primaryFn = (i18nConfig?.translationFunctions ?? DEFAULT_TRANSLATION_FNS)[0] ?? 't';

    let parseModule: typeof import('oxc-parser');
    try {
      const esmRequire = createRequire(import.meta.url);
      parseModule = esmRequire('oxc-parser');
    } catch {
      // OXC not available, skip rule
      return [];
    }

    const ext = ctx.filePath.endsWith('.tsx') ? 'tsx' : 'jsx';
    let ast: OxcNode;
    try {
      const result = (parseModule as any).parseSync(ctx.filePath, ctx.content, {
        sourceType: 'module',
        lang: ext,
      });
      ast = (result as any).program ?? (result as any).ast;
      if (!ast) return [];
    } catch {
      return [];
    }

    const issues: AndsIssue[] = [];

    // Track nodes inside translation call expressions to skip them
    const translationCallSpans = new Set<string>();
    walkAst(ast, (node: OxcNode) => {
      // Detect translation function calls: t('...'), i18n.t('...'), formatMessage({...})
      if (node.type === 'CallExpression') {
        const callee = node.callee;
        let fnName: string | null = null;
        if (callee && typeof callee === 'object') {
          if (callee.type === 'Identifier' && typeof callee.name === 'string') {
            fnName = callee.name;
          } else if (callee.type === 'MemberExpression' && callee.object && callee.property) {
            const obj = typeof callee.object === 'object' && 'name' in callee.object ? callee.object.name : '';
            const prop = typeof callee.property === 'object' && 'name' in callee.property ? callee.property.name : '';
            if (typeof obj === 'string' && typeof prop === 'string') {
              fnName = `${obj}.${prop}`;
            }
          }
        }
        if (fnName && translationFns.has(fnName) && node.span) {
          translationCallSpans.add(`${node.span.start}-${node.span.end}`);
        }
      }
    });

    function isInsideTranslationCall(span?: { start: number; end: number }): boolean {
      if (!span) return false;
      for (const key of translationCallSpans) {
        const [s, e] = key.split('-').map(Number);
        if (s !== undefined && e !== undefined && span.start >= s && span.end <= e) return true;
      }
      return false;
    }

    walkAst(ast, (node: OxcNode) => {
      // Check JSXText nodes
      if (node.type === 'JSXText') {
        if (isInsideTranslationCall(node.span)) return;
        const text = typeof node.value === 'string' ? node.value : '';
        const trimmed = text.trim();
        if (trimmed.length >= 3 && /^[A-Z]/.test(trimmed) && !isNonTranslatable(trimmed)) {
          const line = node.span ? getLineFromOffset(ctx.content, node.span.start) : undefined;
          issues.push({
            category: 'compliance',
            code: 'NO_HARDCODED_STRING',
            message: `Hardcoded string "${trimmed.slice(0, 40)}${trimmed.length > 40 ? '...' : ''}" should use a translation function`,
            ...(line !== undefined ? { loc: { file: ctx.filePath, line } } : { loc: { file: ctx.filePath } }),
            severity,
            hint: `Wrap with ${primaryFn}() or your configured translation function`,
          });
        }
      }

      // Check JSXAttribute string values on user-facing attrs
      if (node.type === 'JSXAttribute') {
        const attrName = getAttrName(node);
        if (!attrName) return;
        if (SKIP_ATTRS.has(attrName)) return;
        if (!checkAttrs.has(attrName)) return;

        if (isInsideTranslationCall(node.span)) return;
        const strValue = getAttrStringValue(node);
        if (strValue && !isNonTranslatable(strValue)) {
          const line = node.span ? getLineFromOffset(ctx.content, node.span.start) : undefined;
          issues.push({
            category: 'compliance',
            code: 'NO_HARDCODED_STRING',
            message: `Hardcoded string in ${attrName}="${strValue.slice(0, 40)}${strValue.length > 40 ? '...' : ''}" should use a translation function`,
            ...(line !== undefined ? { loc: { file: ctx.filePath, line } } : { loc: { file: ctx.filePath } }),
            severity,
            hint: `Use ${attrName}={${primaryFn}('key')} instead`,
          });
        }
      }
    });

    return issues;
  },
};
