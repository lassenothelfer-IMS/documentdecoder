import { Link, Stack } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { spacing } from '@/theme';

// Stack.Toolbar is iOS-only (see settings-button.ios.tsx); other platforms get a plain header link.
export function SettingsButton() {
  return (
    <Stack.Screen
      options={{
        headerRight: () => (
          <Link href="/settings" asChild>
            <Pressable accessibilityRole="link" hitSlop={spacing.sm}>
              {({ pressed }) => (
                <View style={{ paddingHorizontal: spacing.md, opacity: pressed ? 0.6 : 1 }}>
                  <ThemedText variant="headline" tone="primary">
                    Settings
                  </ThemedText>
                </View>
              )}
            </Pressable>
          </Link>
        ),
      }}
    />
  );
}
