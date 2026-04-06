/**
 * @module runners/static
 * @description Tier 1 a11y runner: OXC-based static AST analysis with aria-query.
 *
 * Parses JSX/TSX with oxc-parser (fastest available parser), walks the AST for
 * a11y violations, and cross-references aria-query for ARIA role validation.
 * Falls back to regex checks for non-parseable files.
 */

import type { A11yRunner, A11yRunConfig, AndsIssue } from '@ands/contracts';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// ---------------------------------------------------------------------------
// aria-query data (loaded once)
// ---------------------------------------------------------------------------

let ariaRoles: Map<string, object> | null = null;
let ariaRolesLoaded = false;

async function loadAriaRoles(): Promise<Map<string, object>> {
  if (ariaRolesLoaded && ariaRoles) return ariaRoles;
  ariaRolesLoaded = true;
  try {
    const mod = await import('aria-query');
    ariaRoles = mod.roles as Map<string, object>;
    return ariaRoles;
  } catch {
    ariaRoles = new Map();
    return ariaRoles;
  }
}

// Roles that are deprecated in ARIA 1.2+
const DEPRECATED_ROLES = new Set(['directory', 'doc-biblioentry', 'doc-endnote']);

// Required ARIA attributes per role (subset of most common)
const REQUIRED_ARIA_ATTRS: Record<string, string[]> = {
  checkbox: ['aria-checked'],
  combobox: ['aria-expanded'],
  heading: ['aria-level'],
  meter: ['aria-valuenow'],
  option: ['aria-selected'],
  progressbar: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  scrollbar: ['aria-controls', 'aria-valuenow'],
  separator: ['aria-valuenow'],
  slider: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  spinbutton: ['aria-valuenow'],
  switch: ['aria-checked'],
};

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------

function collectFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
      if (statSync(p).isDirectory()) results.push(...collectFiles(p));
      else if (entry.endsWith('.tsx') || entry.endsWith('.jsx')) results.push(p);
    }
  } catch { /* skip */ }
  return results;
}

// ---------------------------------------------------------------------------
// Regex fallback checks (for files that fail AST parsing)
// ---------------------------------------------------------------------------

const REGEX_CHECKS = [
  {
    pattern: /<img\b(?![^>]*\balt\b)/g,
    code: 'IMG_MISSING_ALT',
    message: '<img> element missing alt attribute',
  },
  {
    pattern: /<button\b[^>]*>\s*<\/button>/g,
    code: 'EMPTY_BUTTON',
    message: '<button> element has no accessible content',
  },
  {
    pattern: /onClick\b(?![^}]*(?:onKeyDown|onKeyPress|onKeyUp))/g,
    code: 'CLICK_MISSING_KEYBOARD',
    message: 'onClick handler without corresponding keyboard handler',
  },
];

function runRegexChecks(content: string, relPath: string): AndsIssue[] {
  const issues: AndsIssue[] = [];
  for (const check of REGEX_CHECKS) {
    check.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = check.pattern.exec(content)) !== null) {
      const before = content.slice(0, match.index);
      const line = before.split('\n').length;
      issues.push({
        category: 'compliance',
        code: check.code,
        message: check.message,
        loc: { file: relPath, line },
        severity: 'error',
      });
    }
  }
  return issues;
}

// ---------------------------------------------------------------------------
// OXC AST-based analysis
// ---------------------------------------------------------------------------

interface OxcSpan {
  start: number;
  end: number;
}

interface OxcNode {
  type: string;
  span?: OxcSpan;
  name?: string | OxcNode;
  value?: string | OxcNode;
  attributes?: OxcNode[];
  children?: OxcNode[];
  openingElement?: OxcNode;
  closingElement?: OxcNode;
  body?: OxcNode[] | OxcNode;
  expression?: OxcNode;
  argument?: OxcNode;
  arguments?: OxcNode[];
  elements?: OxcNode[];
  properties?: OxcNode[];
  declarations?: OxcNode[];
  init?: OxcNode;
  callee?: OxcNode;
  object?: OxcNode;
  property?: OxcNode;
  left?: OxcNode;
  right?: OxcNode;
  consequent?: OxcNode;
  alternate?: OxcNode;
  [key: string]: unknown;
}

function getLineFromOffset(content: string, offset: number): number {
  return content.slice(0, offset).split('\n').length;
}

function getAttrName(attr: OxcNode): string | null {
  if (attr.type === 'JSXAttribute') {
    const nameNode = attr.name;
    if (typeof nameNode === 'string') return nameNode;
    if (nameNode && typeof nameNode === 'object') {
      if ('name' in nameNode && typeof nameNode.name === 'string') return nameNode.name;
      // JSXNamespacedName: namespace:name
      if (nameNode.type === 'JSXNamespacedName') {
        const ns = (nameNode as any).namespace;
        const local = (nameNode as any).name;
        const nsName = typeof ns === 'string' ? ns : ns?.name ?? '';
        const localName = typeof local === 'string' ? local : local?.name ?? '';
        return `${nsName}:${localName}`;
      }
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

function getElementName(openingElement: OxcNode): string | null {
  const nameNode = openingElement.name;
  if (!nameNode) return null;
  if (typeof nameNode === 'string') return nameNode;
  if (typeof nameNode === 'object' && 'name' in nameNode && typeof nameNode.name === 'string') return nameNode.name;
  return null;
}

function hasAttribute(openingElement: OxcNode, attrName: string): boolean {
  const attrs = openingElement.attributes ?? [];
  return attrs.some(a => getAttrName(a) === attrName);
}

function getAttributeValue(openingElement: OxcNode, attrName: string): string | null {
  const attrs = openingElement.attributes ?? [];
  for (const attr of attrs) {
    if (getAttrName(attr) === attrName) {
      return getAttrStringValue(attr);
    }
  }
  return null;
}

function hasChildren(node: OxcNode): boolean {
  const children = node.children ?? [];
  return children.some(c => {
    if (c.type === 'JSXText') {
      return typeof c.value === 'string' && c.value.trim().length > 0;
    }
    return c.type !== 'JSXText';
  });
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

async function runAstChecks(
  content: string,
  relPath: string,
  roles: Map<string, object>,
): Promise<AndsIssue[]> {
  let parseModule: typeof import('oxc-parser');
  try {
    parseModule = await import('oxc-parser');
  } catch {
    // OXC not available, fall back to regex
    return runRegexChecks(content, relPath);
  }

  const ext = relPath.endsWith('.tsx') ? 'tsx' : 'jsx';
  let ast: OxcNode;
  try {
    const result = parseModule.parseSync(relPath, content, {
      sourceType: 'module',
      lang: ext,
    });
    ast = (result as any).program ?? (result as any).ast;
    if (!ast) return runRegexChecks(content, relPath);
  } catch {
    return runRegexChecks(content, relPath);
  }

  const issues: AndsIssue[] = [];

  walkAst(ast, (node: OxcNode) => {
    if (node.type !== 'JSXElement' && node.type !== 'JSXOpeningElement') return;

    const opening = node.type === 'JSXElement' ? node.openingElement : node;
    if (!opening) return;

    const elementName = getElementName(opening);
    if (!elementName) return;

    const offset = opening.span?.start ?? 0;
    const line = getLineFromOffset(content, offset);

    // 1. IMG_MISSING_ALT
    if (elementName === 'img' && !hasAttribute(opening, 'alt')) {
      issues.push({
        category: 'compliance',
        code: 'IMG_MISSING_ALT',
        message: '<img> element missing alt attribute',
        loc: { file: relPath, line },
        severity: 'error',
        hint: 'Add alt="" for decorative images or alt="description" for meaningful ones',
      });
    }

    // 2. EMPTY_BUTTON / EMPTY_INTERACTIVE
    if (
      (elementName === 'button' || elementName === 'a') &&
      node.type === 'JSXElement' &&
      !hasChildren(node) &&
      !hasAttribute(opening, 'aria-label') &&
      !hasAttribute(opening, 'aria-labelledby')
    ) {
      issues.push({
        category: 'compliance',
        code: 'EMPTY_BUTTON',
        message: `<${elementName}> element has no accessible content`,
        loc: { file: relPath, line },
        severity: 'error',
        hint: 'Add text content, aria-label, or aria-labelledby',
      });
    }

    // 3. CLICK_MISSING_KEYBOARD
    if (hasAttribute(opening, 'onClick') && !hasAttribute(opening, 'onKeyDown') &&
        !hasAttribute(opening, 'onKeyPress') && !hasAttribute(opening, 'onKeyUp')) {
      // Skip native interactive elements that already handle keyboard
      const nativeInteractive = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary']);
      const firstChar = elementName[0] ?? '';
      if (!nativeInteractive.has(elementName) && firstChar !== firstChar.toUpperCase()) {
        issues.push({
          category: 'compliance',
          code: 'CLICK_MISSING_KEYBOARD',
          message: 'onClick handler without corresponding keyboard handler',
          loc: { file: relPath, line },
          severity: 'error',
          hint: 'Add onKeyDown handler for keyboard accessibility',
        });
      }
    }

    // 4. INVALID_ARIA_ROLE
    const roleValue = getAttributeValue(opening, 'role');
    if (roleValue) {
      const roleNames = roleValue.split(/\s+/);
      for (const roleName of roleNames) {
        if (roleName && roles.size > 0 && !roles.has(roleName)) {
          // Check against known abstract roles or typos
          issues.push({
            category: 'compliance',
            code: 'INVALID_ARIA_ROLE',
            message: `Invalid ARIA role "${roleName}"`,
            loc: { file: relPath, line },
            severity: 'error',
            hint: 'Use a valid ARIA role from the WAI-ARIA specification',
          });
        }

        // 5. DEPRECATED_ARIA_ROLE
        if (DEPRECATED_ROLES.has(roleName)) {
          issues.push({
            category: 'compliance',
            code: 'DEPRECATED_ARIA_ROLE',
            message: `Deprecated ARIA role "${roleName}"`,
            loc: { file: relPath, line },
            severity: 'warn',
            hint: 'This role is deprecated in ARIA 1.2+. Consider using a newer alternative.',
          });
        }
      }

      // 6. MISSING_REQUIRED_ARIA
      const singleRole = roleNames[0];
      if (singleRole && REQUIRED_ARIA_ATTRS[singleRole]) {
        for (const requiredAttr of REQUIRED_ARIA_ATTRS[singleRole]) {
          if (!hasAttribute(opening, requiredAttr)) {
            issues.push({
              category: 'compliance',
              code: 'MISSING_REQUIRED_ARIA',
              message: `Role "${singleRole}" requires attribute "${requiredAttr}"`,
              loc: { file: relPath, line },
              severity: 'error',
              hint: `Add ${requiredAttr} to the element with role="${singleRole}"`,
            });
          }
        }
      }
    }

    // 7. INVALID_ARIA_VALUE — check aria-* boolean/tristate attributes
    const attrs = opening.attributes ?? [];
    for (const attr of attrs) {
      const name = getAttrName(attr);
      if (!name || !name.startsWith('aria-')) continue;
      const val = getAttrStringValue(attr);
      if (val === null) continue;

      // aria-hidden, aria-disabled, etc. should be "true" or "false"
      const booleanAriaAttrs = new Set([
        'aria-hidden', 'aria-disabled', 'aria-expanded', 'aria-pressed',
        'aria-selected', 'aria-checked', 'aria-required', 'aria-readonly',
        'aria-busy', 'aria-grabbed', 'aria-atomic', 'aria-modal',
        'aria-multiline', 'aria-multiselectable',
      ]);
      if (booleanAriaAttrs.has(name)) {
        const validBool = new Set(['true', 'false', 'mixed', 'undefined']);
        if (!validBool.has(val)) {
          issues.push({
            category: 'compliance',
            code: 'INVALID_ARIA_VALUE',
            message: `Invalid value "${val}" for ${name} (expected true/false)`,
            loc: { file: relPath, line },
            severity: 'error',
          });
        }
      }
    }
  });

  return issues;
}

// ---------------------------------------------------------------------------
// Runner export
// ---------------------------------------------------------------------------

export const staticRunner: A11yRunner = {
  name: 'oxc-static',
  tier: 'static',
  description: 'OXC-based static a11y analysis of JSX/TSX source files with aria-query validation',
  async run(runConfig: A11yRunConfig): Promise<AndsIssue[]> {
    const rootDir = process.cwd();
    const files = runConfig.files
      ? runConfig.files.map(f => join(rootDir, f))
      : collectFiles(join(rootDir, 'src'));

    const roles = await loadAriaRoles();
    const issues: AndsIssue[] = [];

    for (const filePath of files) {
      let content: string;
      try { content = readFileSync(filePath, 'utf8'); } catch { continue; }
      const relPath = relative(rootDir, filePath);
      const fileIssues = await runAstChecks(content, relPath, roles);
      issues.push(...fileIssues);
    }

    return issues;
  },
};
