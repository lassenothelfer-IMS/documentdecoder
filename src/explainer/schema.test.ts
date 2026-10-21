import { sampleLetterExplanation } from '@/dev/sample-letter';

import { LetterExplanationSchema, letterExplanationJsonSchema, letterTypes } from './schema';

describe('letterExplanationJsonSchema', () => {
  it('has no $schema key, to save prompt tokens', () => {
    expect(letterExplanationJsonSchema).not.toHaveProperty('$schema');
  });

  it('requires every field of the explanation', () => {
    expect(letterExplanationJsonSchema).toMatchObject({
      type: 'object',
      required: expect.arrayContaining([
        'sender',
        'letterType',
        'summary',
        'actionRequired',
        'actions',
        'deadlines',
        'amounts',
        'glossary',
      ]),
    });
  });

  it('lists every letter type as an enum value', () => {
    const properties = letterExplanationJsonSchema.properties as Record<string, { enum?: string[] }>;
    expect(properties.letterType.enum).toEqual([...letterTypes]);
  });
});

describe('LetterExplanation', () => {
  it('accepts the sample explanation', () => {
    expect(LetterExplanationSchema.safeParse(sampleLetterExplanation).success).toBe(true);
  });

  it('rejects an unknown letter type', () => {
    expect(LetterExplanationSchema.safeParse({ ...sampleLetterExplanation, letterType: 'parkingTicket' }).success).toBe(
      false,
    );
  });

  it('rejects an amount given as text', () => {
    const amounts = [{ value: '40.00', currency: 'CHF', purpose: 'Fee' }];
    expect(LetterExplanationSchema.safeParse({ ...sampleLetterExplanation, amounts }).success).toBe(false);
  });
});
