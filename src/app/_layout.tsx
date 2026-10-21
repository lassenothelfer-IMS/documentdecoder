import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/db/migrations';
import { AiAvailabilityProvider } from '@/hooks/use-ai-availability';
import { fontAssets, fonts, spacing, useColors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  // A font that fails to load falls back to the system font rather than blocking the app.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // Renders nothing until the database is open and migrated, so the splash covers that too.
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      <AiAvailabilityProvider>
        <AppStack />
      </AiAvailabilityProvider>
    </SQLiteProvider>
  );
}

function AppStack() {
  const colors = useColors();

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fonts.sansSemibold, color: colors.ink },
          headerLargeTitleStyle: { fontFamily: fonts.serifSemibold, color: colors.ink },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        {/* A transparent large-title state lets iOS 26 draw the large title over the paper background. */}
        <Stack.Screen name="index" options={{ headerLargeStyle: { backgroundColor: 'transparent' } }} />
        {/* Blank until the letter loads, instead of the route name. */}
        <Stack.Screen name="letter/[id]" options={{ title: '' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="unavailable" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ai-check" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colors = useColors();

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.paper }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
    >
      <ThemedText variant="title">Brieflos couldn’t start</ThemedText>
      <ThemedText variant="body" selectable>
        {error.message}
      </ThemedText>
      <Button title="Try again" onPress={() => void retry()} />
    </ScrollView>
  );
}
