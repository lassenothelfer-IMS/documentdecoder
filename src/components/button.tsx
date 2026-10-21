import type { SFSymbol } from 'expo-symbols';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useColors } from '@/theme';

import { ThemedText } from './themed-text';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';
type ButtonSize = 'md' | 'lg';

const sizes = {
  md: { paddingVertical: spacing.smd, paddingHorizontal: spacing.md, minHeight: 44 },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 56 },
} as const;

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: SFSymbol;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const look = {
    primary: { background: colors.primary, pressed: colors.primary, foreground: colors.onPrimary },
    secondary: { background: colors.primarySoft, pressed: colors.hairline, foreground: colors.primary },
    destructive: { background: colors.deadlineSoft, pressed: colors.hairline, foreground: colors.deadline },
  }[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? look.pressed : look.background,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : pressed && variant === 'primary' ? 0.85 : 1,
          ...sizes[size],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.foreground} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {icon ? <SymbolView name={icon} size={20} tintColor={look.foreground} /> : null}
          <ThemedText variant="headline" style={{ color: look.foreground }}>
            {title}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}
