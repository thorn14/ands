/**
 * @module plugin
 * @description AndsPlugin registration for @ands/mcp-server.
 *
 * Registers the `serve` top-level command that starts an MCP server
 * exposing ANDS-native resources: ands://policy, ands://guidelines/INDEX, etc.
 * Also exposes tools for a11y, vpat, lint/i18n, and review operations.
 */

import type {
  AndsPlugin,
  TopLevelCommand,
  CliOutput,
  McpEnrichment,
  McpEnrichmentContext,
  McpResponse,
} from '@ands/contracts';

// ---------------------------------------------------------------------------
// ANDS-native resource registry
// ---------------------------------------------------------------------------

interface McpResource {
  uri: string;
  name: string;
  description: string;
}

const andsResources: McpResource[] = [
  {
    uri: 'ands://policy',
    name: 'ANDS Policy',
    description: 'Design system governance policy and token usage rules',
  },
  {
    uri: 'ands://guidelines/INDEX',
    name: 'Guidelines Index',
    description: 'Index of all registered design-system guidelines',
  },
  {
    uri: 'ands://tokens',
    name: 'Token Registry',
    description: 'Foundation token definitions and current values',
  },
  {
    uri: 'ands://patterns',
    name: 'Pattern Catalog',
    description: 'Registered interaction patterns and their schemas',
  },
  {
    uri: 'ands://health',
    name: 'Health Report',
    description: 'Latest design-system health metrics',
  },
  {
    uri: 'ands://vpat/report',
    name: 'VPAT Report',
    description: 'Current VPAT 2.5 WCAG conformance report',
  },
];

// ---------------------------------------------------------------------------
// ANDS MCP tools
// ---------------------------------------------------------------------------

interface McpTool {
  uri: string;
  name: string;
  description: string;
}

const andsTools: McpTool[] = [
  {
    uri: 'ands://a11y/run-static',
    name: 'A11y Static Analysis',
    description: 'Run OXC-based static a11y analysis on JSX/TSX files',
  },
  {
    uri: 'ands://a11y/run-rendered',
    name: 'A11y Rendered Testing',
    description: 'Run axe-core analysis against rendered Storybook stories',
  },
  {
    uri: 'ands://a11y/run-page',
    name: 'A11y Page Audit',
    description: 'Run Lighthouse accessibility audit against a URL',
  },
  {
    uri: 'ands://lint/i18n',
    name: 'i18n Lint',
    description: 'Check for hardcoded user-facing strings that should use translation functions',
  },
  {
    uri: 'ands://lint/pii',
    name: 'PII Detection',
    description: 'Scan source code for potential PII exposure patterns',
  },
  {
    uri: 'ands://review/suggest',
    name: 'Review Suggestions',
    description: 'Run a11y/lint review and generate LLM-powered fix suggestions',
  },
  {
    uri: 'ands://review/explain',
    name: 'Explain Issue',
    description: 'Explain a specific a11y issue with fix context',
  },
];

// ---------------------------------------------------------------------------
// Default enrichment: pass-through
// ---------------------------------------------------------------------------

const passThroughEnrichment: McpEnrichment = {
  upstreamType: '*',
  name: 'ands-context',
  description: 'Annotates upstream MCP responses with ANDS design-system context',
  enrich: async (response: unknown, _context: McpEnrichmentContext): Promise<unknown> => {
    // Placeholder: returns the response as-is with an ANDS marker
    if (typeof response === 'object' && response !== null) {
      return { ...response, _ands: { enriched: true } };
    }
    return response;
  },
};

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

const serveCommand: TopLevelCommand = {
  name: 'serve',
  description: 'Start the ANDS MCP server exposing design-system resources and tools',
  handler: async (args, _config) => {
    const portFlag = typeof args.flags['port'] === 'string' ? args.flags['port'] : undefined;
    const port = portFlag ? parseInt(portFlag, 10) : 3333;

    if (isNaN(port) || port < 1 || port > 65535) {
      return {
        outputVersion: '1.0.0',
        command: 'serve',
        ok: false,
        exitCode: 4,
        summary: `Invalid port: ${portFlag ?? 'NaN'}`,
        issues: [
          {
            category: 'schema',
            code: 'INVALID_PORT',
            message: `Port must be a number between 1 and 65535, got '${portFlag ?? ''}'`,
            severity: 'error',
          },
        ],
      } satisfies CliOutput;
    }

    // Log startup message (placeholder — does not actually bind a port)
    const resourceList = andsResources.map((r) => r.uri);
    const toolList = andsTools.map((t) => t.uri);

    // Build a sample response showing registered resources
    const responses: McpResponse[] = andsResources.map((r) => ({
      resource: r.uri,
      content: { name: r.name, description: r.description },
    }));

    return {
      outputVersion: '1.0.0',
      command: 'serve',
      ok: true,
      exitCode: 0,
      summary: `MCP server starting on port ${port}`,
      issues: [],
      data: {
        port,
        resources: resourceList,
        tools: toolList,
        responses,
        enrichments: [passThroughEnrichment.name],
      },
    } satisfies CliOutput;
  },
};

export const mcpServerPlugin = {
  name: '@ands/mcp-server',
  topLevelCommands: [serveCommand],
  mcpEnrichments: [passThroughEnrichment],
} satisfies AndsPlugin;
