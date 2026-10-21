import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { radius, spacing, useColors } from '@/theme';

/** Shown on Home while on-device AI can't be used; opens the explanation screen. */
export function AiNotice() {
  const colors = useColors();

  return (
    <Link href="/unavailable" asChild>
      <Pressable accessibilityRole="link">
        {({ pressed }) => (
          <View
            style={{
              backgroundColor: pressed ? colors.hairline : colors.primarySoft,
              borderRadius: radius.md,
              borderCurve: 'continuous',
              paddingVertical: spacing.smd,
              paddingHorizontal: spacing.md,
              gap: 2,
            }}
          >
            <ThemedText variant="headline" tone="primary">
              On-device AI is not available
            </ThemedText>
            <ThemedText variant="subhead" tone="muted">
              Letters can’t be explained on this device yet. See why
            </ThemedText>
          </View>
        )}
      </Pressable>
    </Link>
  );
}
