import { getLocales } from 'expo-localization';

import type { OutputLanguage } from '@/explainer/types';

/** Explanations follow the device language: German for German-language devices, English otherwise. */
export function getOutputLanguage(): OutputLanguage {
  return getLocales()[0]?.languageCode === 'de' ? 'de' : 'en';
}
