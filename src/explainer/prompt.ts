import type { OutputLanguage } from './types';

const languageInstruction: Record<OutputLanguage, string> = {
  en: 'English',
  de: 'German as written in Switzerland (always "ss", never "ß")',
};

export function buildSystemPrompt(language: OutputLanguage): string {
  return [
    'You explain official Swiss letters to people who are not experts.',
    'Read the letter and fill in every field of the JSON object.',
    `Write all text fields in ${languageInstruction[language]}, in plain language at level B1: short sentences, everyday words. Keep names, terms and quotes from the letter as they are.`,
    'summary: 3 to 5 sentences on who wrote, why, and what it means for the reader.',
    'actionRequired: true only if the reader must do something, such as pay, reply, object or send documents.',
    'actions: concrete steps in order. Empty if there is nothing to do.',
    'deadlines: only dates printed in the letter, as YYYY-MM-DD.',
    'amounts: only amounts printed in the letter. value is a number, currency as printed (usually CHF).',
    'glossary: up to 5 official terms from the letter, each with a short explanation.',
    'Never guess. Leave out anything the letter does not say. If the sender is unclear, write "unclear"; if the type is unclear, use "other".',
  ].join('\n');
}

export function buildUserMessage(letterText: string): string {
  return `Letter text:\n"""\n${letterText.trim()}\n"""`;
}
