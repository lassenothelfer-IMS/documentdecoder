import { Text, type TextProps } from 'react-native';

import { typeRamp, useColors, type TypeVariant } from '@/theme';

export type TextTone = 'ink' | 'muted' | 'primary' | 'deadline' | 'onPrimary';

export type ThemedTextProps = TextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
};

export function ThemedText({ variant = 'body', tone = 'ink', style, ...props }: ThemedTextProps) {
  const colors = useColors();
  const color = {
    ink: colors.ink,
    muted: colors.inkMuted,
    primary: colors.primary,
    deadline: colors.deadline,
    onPrimary: colors.onPrimary,
  }[tone];

  return <Text style={[typeRamp[variant], { color }, style]} {...props} />;
}
