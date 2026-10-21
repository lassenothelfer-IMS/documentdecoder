# Document Decoder: MVP Spec (React Native / Expo)

Working name: **Brieflos** (placeholder, change anytime)

## One-line pitch
Scan a Swiss official letter, get a plain-language explanation of what it says, what you have to do, and by when. Fully on-device: the letter never leaves your iPhone.

## Target user
People in Switzerland who receive official mail they don't fully understand: young adults getting their first tax or Krankenkasse letters, expats, parents handling paperwork for family.

## MVP scope (v0.1)

### In
1. **Capture**: scan with the document camera, pick a photo, or import a PDF
2. **Read**: on-device OCR (German first, French/Italian/English recognized)
3. **Explain** (on-device AI, structured output):
   - Who sent it and what kind of letter it is
   - Plain-language summary (3 to 5 sentences, B1 level)
   - "Do I need to do something?" yes/no, plus concrete action items
   - Deadlines and amounts
4. **Swiss letter rules**: small hand-written rule table for high-stakes letter types (see below), shown as a warning card
5. **QR-bill**: detect and parse a Swiss QR-Rechnung deterministically (no AI) and show amount, creditor, reference
6. **History**: list of past decoded letters, stored locally
7. **Add deadline to calendar**
8. **Trust UI**: "AI generated, not legal advice" label on every result; show the original text next to the explanation

### Out (later)
Android, cloud model fallback, French/Italian UI, chat follow-up questions, paywall/credits, cloud sync, widgets, sharing.

## Platform and stack
- **Expo** (latest SDK), **TypeScript** strict, **expo-router**
- **Development build, not Expo Go.** Expo Go can't load the native modules this app needs. Run on the iPhone with `npx expo run:ios --device` (uses Xcode locally) or build with EAS.
- iOS 26+ target for v0.1 (needed for Apple Foundation Models)

| Need | Package | Notes |
|---|---|---|
| On-device AI | `expo-ai-kit` | Apple Foundation Models on iOS, `generateObject` with JSON schema. Alternative: `@react-native-ai/apple`. Verify in M1 which works better. |
| Document camera | `react-native-document-scanner-plugin` | Uses Apple's VisionKit scanner on iOS |
| Photo / PDF picking | `expo-image-picker`, `expo-document-picker` | |
| OCR, QR detection, PDF text | **local Expo module** `modules/doc-reader` (Swift, Expo Modules API) | Wraps Apple Vision + PDFKit. Small, and avoids depending on several half-maintained libraries |
| Storage | `expo-sqlite` | History, local only |
| Calendar | `expo-calendar` | Write deadlines only |
| Validation | `zod` | Validate AI output shape |
| Tests | `jest` (`jest-expo`) | Preprocessor + validator |

No network calls, no analytics.

### Local native module: `doc-reader`
Expo Modules API, Swift, iOS only for now:
- `recognizeText(imageUri, languages) -> { text, blocks }` using Vision (`RecognizeDocumentsRequest` on iOS 26, else `VNRecognizeTextRequest`), languages `de-CH, de-DE, fr-FR, it-IT, en-US`
- `detectQRCodes(imageUri) -> string[]` using Vision barcode detection
- `extractPdfText(pdfUri) -> { pages: string[], isScanned: boolean }` using PDFKit; if a page has no text, render it to an image and run OCR

## Architecture

```
Capture  ->  doc-reader  ->  Preprocessor  ->  DocumentExplainer  ->  Validator  ->  Result screen
(scanner/    (OCR/PDF/QR)   (QR-bill, dates,     (interface;          (cross-check
 photo/PDF)                  CHF amounts, IBAN    on-device impl)      AI vs source)
                             in TypeScript)
                                     |
                              SwissRules (rules.json)
```

- `DocumentExplainer` is a **TypeScript interface** so a cloud implementation (and Android) can be swapped in later without touching the UI.
- Check model availability at launch and show a clear screen for each reason (device not eligible, Apple Intelligence off, model downloading).
- **Context limit**: the on-device model has a small context window. If the OCR text is too long, summarize per page first, then combine. Strip boilerplate (footers, repeated headers) before sending.
- Preprocessor is pure TypeScript with no native dependencies, so it's fully unit-testable.

### AI output schema (starting point)

```ts
const LetterExplanation = z.object({
  sender: z.string(),                 // e.g. "Steueramt Kanton Zürich"
  letterType: z.enum([
    "taxAssessment", "taxReminder", "healthInsurancePremium",
    "healthInsuranceStatement", "debtCollection", "invoice",
    "municipality", "fine", "other",
  ]),
  summary: z.string(),                // 3 to 5 simple sentences
  actionRequired: z.boolean(),
  actions: z.array(z.object({ step: z.string() })),
  deadlines: z.array(z.object({ date: z.string(), what: z.string() })),
  amounts: z.array(z.object({ value: z.number(), currency: z.string(), purpose: z.string() })),
  glossary: z.array(z.object({ term: z.string(), explanation: z.string() })),
});
```

Pass the JSON schema version to `generateObject`. Output language follows the device language (German or English for v0.1).

### Anti-hallucination rules
- Every deadline and amount the AI returns must also be found by the preprocessor in the source text. If not, show it greyed out with "not found in letter, check manually".
- QR-bill values always come from the parser, never from the AI.
- The prompt instructs the model to say "unclear" rather than guess.

## Swiss rules table (v0.1)
Stored as `assets/rules.json`, shown as a warning card when the letter type matches. **Verify each against the official source before shipping.**

| Letter type | Key point to show | Verify at |
|---|---|---|
| Zahlungsbefehl (Betreibung) | Rechtsvorschlag possible within 10 days of receiving it | SchKG Art. 74 (fedlex.admin.ch) |
| Krankenkasse premium change | Basic insurance can be switched; cancellation must arrive by 30 Nov | bag.admin.ch |
| Steuerveranlagung | Einsprache within 30 days (canton-specific) | cantonal tax office site |
| Steuer Mahnung | Missed deadline; request extension or file now | cantonal tax office site |

## Screens (expo-router)
1. `/` **Home**: big "Scan letter" button, secondary "Import PDF / Photo", history list below
2. `/processing` **Processing**: progress (reading, understanding), cancellable
3. `/letter/[id]` **Result**: sender + type header, action card (yes/no + steps), deadline chips with "Add to calendar", amounts, QR-bill card, rules warning, summary, glossary, collapsible original text, AI disclaimer
4. `/unavailable` **Unavailable**: explains why on-device AI isn't available and what to do
5. `/settings` **Settings**: language, delete all data, about/disclaimer

Design: follow the "doesn't look AI-generated" rules. One concept (calm, paper-like, official-letter feel), one dominant color plus one sharp accent for deadlines, a strong serif/sans pairing loaded with `expo-font`, no gradients or glass.

## Privacy and compliance
- Privacy label: Data Not Collected
- Permission strings in `app.json` (`ios.infoPlist`): camera, photo library, calendar write-only
- EU AI Act transparency: label AI output clearly
- App Store review: frame as "explains letters", never "legal advice"; disclaimer on onboarding and every result

## Test fixtures
Create 6 to 8 **fictional** sample letters as text + rendered PDF in `fixtures/` (Steuer Mahnung, Veranlagung, Krankenkasse Prämienänderung, Leistungsabrechnung, Zahlungsbefehl, Gemeinde Gebührenrechnung with QR-bill, Busse, plain invoice). Use them for jest tests of the preprocessor/validator and for manually judging AI output quality.

## Milestones
1. **M1 Skeleton**: expo-router structure, SQLite history, Home screen, dev build running on iPhone, AI availability check + a test `generateObject` call to confirm the package works
2. **M2 Text in**: `doc-reader` module, scanner, photo, PDF import, show raw OCR text
3. **M3 Preprocessor**: dates, CHF amounts, IBAN, QR-bill parser, with jest tests on fixtures
4. **M4 AI explain**: on-device explainer, prompt, chunking, Result screen
5. **M5 Trust**: validator, rules table, disclaimer, original-text view
6. **M6 Polish**: calendar export, design pass, onboarding, TestFlight via EAS

## Success check for the MVP
On the fixtures plus 10 real letters from family: correct letter type and correct deadlines in at least 9 of 10, no invented amounts.
