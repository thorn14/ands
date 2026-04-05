import { describe, it, expect } from 'vitest';
import { parseResponse } from '../response-parser.js';

describe('response-parser', () => {
  it('parses valid JSON array', () => {
    const response = JSON.stringify([{
      issueCode: 'EMPTY_BUTTON',
      fix: '+ <button>Click me</button>',
      explanation: 'Button needs content',
      wcagCriterion: '4.1.2',
    }]);

    const suggestions = parseResponse(response);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]!.issueCode).toBe('EMPTY_BUTTON');
  });

  it('parses JSON in markdown code block', () => {
    const response = '```json\n[{"issueCode":"TEST","fix":"x","explanation":"y","wcagCriterion":"1.1.1"}]\n```';
    const suggestions = parseResponse(response);
    expect(suggestions).toHaveLength(1);
  });

  it('handles single object (not array)', () => {
    const response = JSON.stringify({
      issueCode: 'TEST',
      fix: 'x',
      explanation: 'y',
      wcagCriterion: '1.1.1',
    });
    const suggestions = parseResponse(response);
    expect(suggestions).toHaveLength(1);
  });

  it('returns empty array for malformed response', () => {
    const suggestions = parseResponse('This is not JSON at all');
    expect(suggestions).toHaveLength(0);
  });

  it('filters invalid items from array', () => {
    const response = JSON.stringify([
      { issueCode: 'VALID', fix: 'x', explanation: 'y' },
      { invalid: true },
      'not an object',
    ]);
    const suggestions = parseResponse(response);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]!.issueCode).toBe('VALID');
  });

  it('extracts JSON array from mixed text', () => {
    const response = 'Here are the fixes:\n[{"issueCode":"A","fix":"b","explanation":"c"}]\nThat is all.';
    const suggestions = parseResponse(response);
    expect(suggestions).toHaveLength(1);
  });
});
