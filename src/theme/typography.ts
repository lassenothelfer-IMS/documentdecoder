import { Platform, type TextStyle } from 'react-native';

import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
} from '@expo-google-fonts/source-sans-3';
import {
  SourceSerif4_400Regular,
  SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4';

// One family name per static weight file, so weight comes from fontFamily and never fontWeight.
export const fonts = {
  serif: 'SourceSerif4_400Regular',
  serifSemibold: 'SourceSerif4_600SemiBold',
  sans: 'SourceSans3_400Regular',
  sansSemibold: 'SourceSans3_600SemiBold',
} as const;

export const fontAssets = {
  [fonts.serif]: SourceSerif4_400Regular,
  [fonts.serifSemibold]: SourceSerif4_600SemiBold,
  [fonts.sans]: SourceSans3_400Regular,
  [fonts.sansSemibold]: SourceSans3_600SemiBold,
};

export const typeRamp = {
  largeTitle: { fontFamily: fonts.serifSemibold, fontSize: 34, lineHeight: 41 },
  title: { fontFamily: fonts.serifSemibold, fontSize: 24, lineHeight: 30 },
  headline: { fontFamily: fonts.sansSemibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 24 },
  letter: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 26 },
  subhead: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 18, letterSpacing: 0.6 },
  // System monospace, for raw model output on developer screens only.
  code: { fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 13, lineHeight: 18 },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof typeRamp;
