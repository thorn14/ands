/**
 * @module response-parser
 * @description Parses structured LLM responses into review suggestions.
 */

export interface ReviewSuggestion {
  issueCode: string;
  fix: string;
  explanation: string;
  wcagCriterion: string;
}

/**
 * Parse an LLM response into ReviewSuggestion[].
 * Handles JSON arrays, JSON in markdown code blocks, and malformed responses.
 */
export function parseResponse(response: string): ReviewSuggestion[] {
  // Try to extract JSON from markdown code blocks
  const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1]! : response;

  try {
    const parsed = JSON.parse(jsonStr.trim());
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidSuggestion);
    }
    if (isValidSuggestion(parsed)) {
      return [parsed];
    }
  } catch {
    // Try to find any JSON array in the response
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        const parsed = JSON.parse(arrayMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.filter(isValidSuggestion);
        }
      } catch {
        // Give up
      }
    }
  }

  return [];
}

function isValidSuggestion(obj: unknown): obj is ReviewSuggestion {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.issueCode === 'string' &&
    typeof o.fix === 'string' &&
    typeof o.explanation === 'string'
  );
}
