/**
 * @module mcp
 * @description Types for ANDS MCP (Model Context Protocol) server enrichments.
 *
 * MCP enrichments allow plugins to augment upstream MCP responses with
 * ANDS-specific context (token mappings, guideline annotations, etc.).
 */

export interface McpEnrichment {
  upstreamType: string;
  name: string;
  description: string;
  enrich: (response: unknown, context: McpEnrichmentContext) => Promise<unknown>;
}

export interface McpEnrichmentContext {
  config: unknown;
  upstreamName: string;
}

export interface McpResponse {
  resource: string;
  content: unknown;
  enrichments?: string[];
}
