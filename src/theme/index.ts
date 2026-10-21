export { splashBackground, useColors, type Colors } from './colors';
export { fontAssets, fonts, typeRamp, type TypeVariant } from './typography';

export const spacing = {
  xs: 4,
  sm: 8,
  smd: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Paper corners: modest radii, always paired with borderCurve: 'continuous'.
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

export const shadows = {
  sheet: '0 1px 2px rgba(28, 33, 39, 0.06)',
} as const;
