import { sampleLetterExplanation } from '@/dev/sample-letter';

import { parseExplanation, toLetterSummary } from './letters';

describe('parseExplanation', () => {
  it('reads a stored explanation back', () => {
    expect(parseExplanation(JSON.stringify(sampleLetterExplanation))).toEqual(sampleLetterExplanation);
  });

  it('returns null when there is no explanation', () => {
    expect(parseExplanation(null)).toBeNull();
  });

  it('returns null for corrupt JSON instead of throwing', () => {
    expect(parseExplanation('{"sender":')).toBeNull();
  });

  it('returns null for JSON that no longer matches the schema', () => {
    expect(parseExplanation(JSON.stringify({ sender: 'Steueramt' }))).toBeNull();
  });
});

describe('toLetterSummary', () => {
  it('maps a database row', () => {
    const summary = toLetterSummary({
      id: 7,
      created_at: Date.UTC(2026, 9, 21),
      source: 'pdf',
      explanation_json: null,
    });
    expect(summary).toEqual({
      id: 7,
      createdAt: new Date(Date.UTC(2026, 9, 21)),
      source: 'pdf',
      explanation: null,
    });
  });

  it('treats an unknown source as a scan', () => {
    expect(toLetterSummary({ id: 1, created_at: 0, source: 'fax', explanation_json: null }).source).toBe('scan');
  });
});
