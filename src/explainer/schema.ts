import * as z from 'zod';

export const letterTypes = [
  'taxAssessment',
  'taxReminder',
  'healthInsurancePremium',
  'healthInsuranceStatement',
  'debtCollection',
  'invoice',
  'municipality',
  'fine',
  'other',
] as const;

export const LetterExplanationSchema = z.object({
  sender: z.string().describe('Organisation that sent the letter, or "unclear"'),
  letterType: z.enum(letterTypes),
  summary: z.string().describe('3 to 5 simple sentences'),
  actionRequired: z.boolean(),
  actions: z.array(z.object({ step: z.string() })),
  deadlines: z.array(
    z.object({
      date: z.string().describe('The date printed in the letter, written as YYYY-MM-DD'),
      what: z.string(),
    }),
  ),
  amounts: z.array(
    z.object({
      value: z.number(),
      currency: z.string().describe('ISO code, usually CHF'),
      purpose: z.string(),
    }),
  ),
  glossary: z.array(z.object({ term: z.string(), explanation: z.string() })),
});

export type LetterExplanation = z.infer<typeof LetterExplanationSchema>;
export type LetterType = LetterExplanation['letterType'];

// The model sees this schema verbatim in its prompt, so drop the $schema URL to save context tokens.
const { $schema: _unused, ...jsonSchema } = z.toJSONSchema(LetterExplanationSchema);
export const letterExplanationJsonSchema: Record<string, unknown> = jsonSchema;
