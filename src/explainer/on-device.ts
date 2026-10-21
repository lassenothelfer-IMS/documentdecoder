import { ExplainError, type DocumentExplainer } from './types';

// Apple Foundation Models only exists on iOS; web and Android get this stub (see on-device.ios.ts).
export const onDeviceExplainer: DocumentExplainer = {
  async checkAvailability() {
    return { status: 'unavailable', reason: 'unsupportedPlatform' };
  },

  async explain() {
    throw new ExplainError('unavailable', 'On-device AI is only available in the iPhone app.');
  },
};
