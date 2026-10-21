import type { LetterExplanation } from '@/explainer/schema';

// A fictional letter for development: the history list before scanning exists (M2),
// and the on-device AI check. Every name, address and amount is made up.
export const sampleLetterText = `Steueramt Musterwil
Bahnhofstrasse 12
8999 Musterwil

Frau
Anna Beispiel
Lindenweg 4
8999 Musterwil

Musterwil, 6. Oktober 2026

Mahnung: Steuererklärung 2025

Sehr geehrte Frau Beispiel

Gemäss unseren Unterlagen ist Ihre Steuererklärung 2025 noch nicht bei uns eingegangen. Die Frist ist am 30. September 2026 abgelaufen.

Wir fordern Sie auf, die vollständig ausgefüllte Steuererklärung bis spätestens 5. November 2026 einzureichen. Wenn Sie mehr Zeit benötigen, können Sie vor Ablauf dieser Frist online eine Fristerstreckung beantragen.

Reichen Sie die Steuererklärung nicht fristgerecht ein, nehmen wir eine Veranlagung nach pflichtgemässem Ermessen vor und können eine Ordnungsbusse von bis zu CHF 1'000.00 verhängen. Für diese Mahnung erheben wir eine Gebühr von CHF 40.00.

Freundliche Grüsse

Steueramt Musterwil`;

// Hand-written, not model output, so the history list can be checked without a device.
export const sampleLetterExplanation: LetterExplanation = {
  sender: 'Steueramt Musterwil',
  letterType: 'taxReminder',
  summary:
    'The tax office has not received your 2025 tax return. The deadline was 30 September 2026. You now have until 5 November 2026 to send it. If you miss this date, the office will estimate your taxes itself and can fine you. This reminder costs CHF 40.',
  actionRequired: true,
  actions: [
    { step: 'Fill in your 2025 tax return completely.' },
    { step: 'Send it to the Steueramt Musterwil by 5 November 2026.' },
    { step: 'If you need more time, ask for an extension online before 5 November 2026.' },
  ],
  deadlines: [{ date: '2026-11-05', what: 'Send the 2025 tax return' }],
  amounts: [
    { value: 40, currency: 'CHF', purpose: 'Fee for this reminder' },
    { value: 1000, currency: 'CHF', purpose: 'Highest possible fine if you miss the deadline' },
  ],
  glossary: [
    { term: 'Fristerstreckung', explanation: 'More time to hand in the tax return. You must ask for it before the deadline.' },
    {
      term: 'Veranlagung nach pflichtgemässem Ermessen',
      explanation: 'The tax office estimates your income and your taxes itself, without your tax return.',
    },
    { term: 'Ordnungsbusse', explanation: 'A fine for not following the rules, here for a late tax return.' },
  ],
};
