import { Stack } from 'expo-router';

import { fonts, useColors } from '@/theme';

/**
 * Sets the navigation bar title. Stack.Title replaces the layout's headerTitleStyle, so the
 * app's fonts and ink colour are passed here on every screen.
 */
export function ScreenTitle({ children, large = false }: { children: string; large?: boolean }) {
  const colors = useColors();

  return (
    <Stack.Title
      large={large}
      style={{ fontFamily: fonts.sansSemibold, color: colors.ink }}
      largeStyle={{ fontFamily: fonts.serifSemibold, color: colors.ink }}
    >
      {children}
    </Stack.Title>
  );
}
