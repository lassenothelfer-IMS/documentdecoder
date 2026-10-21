import type { LetterType } from '@/explainer/schema';

export const letterTypeLabels: Record<LetterType, string> = {
  taxAssessment: 'Tax assessment',
  taxReminder: 'Tax reminder',
  healthInsurancePremium: 'Health insurance premium',
  healthInsuranceStatement: 'Health insurance statement',
  debtCollection: 'Debt collection',
  invoice: 'Invoice',
  municipality: 'Municipality',
  fine: 'Fine',
  other: 'Letter',
};
