import {
  generateObject,
  isAvailable,
  prepareBuiltInModel,
  type JSONSchema,
} from 'expo-ai-kit';

import { buildSystemPrompt, buildUserMessage } from './prompt';
import { LetterExplanationSchema, letterExplanationJsonSchema } from './schema';
import {
  ExplainError,
  type AiAvailability,
  type AiUnavailableReason,
  type DocumentExplainer,
} from './types';

// Each repair re-sends the whole conversation, which eats into the model's 4096-token context.
const MAX_REPAIR_ATTEMPTS = 1;

function errorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function unavailableReason(error: unknown): { reason: AiUnavailableReason; detail?: string } {
  const detail = errorMessage(error);
  switch (errorCode(error)) {
    case 'MODEL_NOT_DOWNLOADED':
      return { reason: 'modelNotReady', detail };
    case 'LLM_NOT_ENABLED':
      return { reason: 'notEnabledInBuild', detail };
    case 'DEVICE_NOT_SUPPORTED':
      // expo-ai-kit 0.18 reports both of these Apple reasons with one code; only the message differs.
      if (/not enabled/i.test(detail)) {
        return { reason: 'appleIntelligenceNotEnabled', detail };
      }
      return { reason: 'deviceNotEligible', detail };
    default:
      return { reason: 'unknown', detail };
  }
}

function toExplainError(error: unknown): ExplainError {
  const message = errorMessage(error);
  switch (errorCode(error)) {
    case 'INFERENCE_BUSY':
      return new ExplainError('busy', message, error);
    case 'INFERENCE_CANCELLED':
      return new ExplainError('cancelled', message, error);
    case 'INFERENCE_FAILED':
      return new ExplainError('invalidOutput', message, error);
    case 'DEVICE_NOT_SUPPORTED':
    case 'MODEL_NOT_DOWNLOADED':
    case 'LLM_NOT_ENABLED':
      return new ExplainError('unavailable', message, error);
    default:
      return new ExplainError('failed', message, error);
  }
}

export const onDeviceExplainer: DocumentExplainer = {
  async checkAvailability(): Promise<AiAvailability> {
    try {
      if (await isAvailable()) {
        return { status: 'available' };
      }
      // isAvailable() gives no reason; prepareBuiltInModel() throws one.
      await prepareBuiltInModel();
      return { status: 'available' };
    } catch (error) {
      return { status: 'unavailable', ...unavailableReason(error) };
    }
  },

  async explain(letterText, { language, signal }) {
    let output: unknown;
    try {
      const result = await generateObject(
        [{ role: 'user', content: buildUserMessage(letterText) }],
        letterExplanationJsonSchema as JSONSchema,
        {
          systemPrompt: buildSystemPrompt(language),
          signal,
          maxRepairAttempts: MAX_REPAIR_ATTEMPTS,
        },
      );
      output = result.object;
    } catch (error) {
      throw toExplainError(error);
    }

    const parsed = LetterExplanationSchema.safeParse(output);
    if (!parsed.success) {
      throw new ExplainError(
        'invalidOutput',
        'The model returned an explanation in an unexpected shape.',
        parsed.error,
      );
    }
    return parsed.data;
  },
};
