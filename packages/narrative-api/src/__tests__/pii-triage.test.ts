import { describe, it, expect } from 'vitest';
import { builtInTriageRules } from '../triage/rules.js';

function matchRule(fieldName: string) {
  for (const rule of builtInTriageRules) {
    if (rule.pattern.test(fieldName)) {
      return { triage: rule.triage, reason: rule.reason };
    }
  }
  return null;
}

describe('PII triage rules', () => {
  it('classifies email fields as sensitive', () => {
    expect(matchRule('user_email')?.triage).toBe('sensitive');
    expect(matchRule('email')?.triage).toBe('sensitive');
  });

  it('classifies SSN fields as critical', () => {
    expect(matchRule('ssn')?.triage).toBe('critical');
    expect(matchRule('social_security')?.triage).toBe('critical');
    expect(matchRule('national_id')?.triage).toBe('critical');
  });

  it('classifies phone fields as sensitive', () => {
    expect(matchRule('phone')?.triage).toBe('sensitive');
    expect(matchRule('mobile')?.triage).toBe('sensitive');
  });

  it('classifies credit card fields as critical', () => {
    expect(matchRule('credit_card')?.triage).toBe('critical');
    expect(matchRule('card_number')?.triage).toBe('critical');
    expect(matchRule('cvv')?.triage).toBe('critical');
  });

  it('classifies address fields as sensitive', () => {
    expect(matchRule('address')?.triage).toBe('sensitive');
    expect(matchRule('zip')?.triage).toBe('sensitive');
    expect(matchRule('postal')?.triage).toBe('sensitive');
  });

  it('classifies DOB fields as sensitive', () => {
    expect(matchRule('dob')?.triage).toBe('sensitive');
    expect(matchRule('birth_date')?.triage).toBe('sensitive');
    expect(matchRule('date_of_birth')?.triage).toBe('sensitive');
  });

  it('does not match unrelated fields', () => {
    expect(matchRule('first_name')).toBeNull();
    expect(matchRule('color')).toBeNull();
    expect(matchRule('width')).toBeNull();
  });
});
