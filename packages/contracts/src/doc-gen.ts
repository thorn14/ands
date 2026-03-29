/**
 * @module doc-gen
 * @description Types for ANDS documentation generation and staleness detection.
 *
 * `DocSource` describes how to extract documentation metadata from source files.
 * The doc-gen plugin uses these to produce API docs and detect stale documentation.
 */

export interface DocSource {
  name: string;
  glob: string;
  extract: (filePath: string, content: string) => DocSourceOutput;
}

export interface DocSourceOutput {
  title: string;
  description?: string;
  props?: Record<string, { type: string; required: boolean; description?: string }>;
  examples?: string[];
}
