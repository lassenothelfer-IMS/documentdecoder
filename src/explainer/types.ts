import type { LetterExplanation } from './schema';

export type OutputLanguage = 'de' | 'en';

export type AiUnavailableReason =
  | 'deviceNotEligible'
  | 'appleIntelligenceNotEnabled'
  | 'modelNotReady'
  | 'notEnabledInBuild'
  | 'unsupportedPlatform'
  | 'unknown';

export type AiAvailability =
  | { status: 'available' }
  | { status: 'unavailable'; reason: AiUnavailableReason; detail?: string };

export type ExplainOptions = {
  language: OutputLanguage;
  signal?: AbortSignal;
};

/**
 * Turns the text of a letter into a structured explanation. The UI only talks to this
 * interface, so a cloud or Android implementation can replace the on-device one later.
 */
export interface DocumentExplainer {
  checkAvailability(): Promise<AiAvailability>;
  explain(letterText: string, options: ExplainOptions): Promise<LetterExplanation>;
}

export type ExplainErrorCode = 'unavailable' | 'busy' | 'cancelled' | 'invalidOutput' | 'failed';

export class ExplainError extends Error {
  code: ExplainErrorCode;
  cause?: unknown;

  constructor(code: ExplainErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'ExplainError';
    this.code = code;
    this.cause = cause;
  }
}
