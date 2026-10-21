import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/button';
import { Group, GroupRow } from '@/components/group';
import { ScreenTitle } from '@/components/screen-title';
import { ThemedText } from '@/components/themed-text';
import type { AiUnavailableReason } from '@/explainer/types';
import { useAiAvailability } from '@/hooks/use-ai-availability';
import { spacing, useColors } from '@/theme';

const reasons: Record<AiUnavailableReason, { title: string; body: string; steps: string[]; canRecheck: boolean }> = {
  deviceNotEligible: {
    title: "This iPhone can’t run Apple Intelligence",
    body: 'Brieflos explains letters with the AI model built into iOS, so your letters never leave the phone. That model needs iPhone 15 Pro, iPhone 16 or newer.',
    steps: ['You can still open the letters already saved in Brieflos.'],
    canRecheck: false,
  },
  appleIntelligenceNotEnabled: {
    title: 'Turn on Apple Intelligence',
    body: 'Brieflos uses the AI model built into iOS. It only works while Apple Intelligence is on.',
    steps: [
      'Open the Settings app and tap Apple Intelligence & Siri.',
      'Turn on Apple Intelligence.',
      'Device language and Siri language must be the same supported language, for example German or English.',
      'Come back to Brieflos. It checks again by itself.',
    ],
    canRecheck: true,
  },
  modelNotReady: {
    title: 'The AI model is still downloading',
    body: 'iOS downloads the Apple Intelligence model in the background after you turn it on. This can take a while.',
    steps: ['Keep the iPhone connected to Wi-Fi and power.', 'Try again in a few minutes.'],
    canRecheck: true,
  },
  notEnabledInBuild: {
    title: 'This build has no on-device AI',
    body: 'The app was built without the AI module. Add ["expo-ai-kit", { "llm": true }] to the plugins in app.json and make a new development build.',
    steps: [],
    canRecheck: false,
  },
  unsupportedPlatform: {
    title: 'On-device AI only works on iPhone',
    body: 'Explanations come from the AI model built into iOS 26 or later. This preview runs without it, so letters can be saved and read, but not explained.',
    steps: [],
    canRecheck: false,
  },
  unknown: {
    title: "On-device AI couldn’t be checked",
    body: 'Something went wrong while checking Apple Intelligence on this iPhone.',
    steps: ['Restart the app and try again.'],
    canRecheck: true,
  },
};

// Opened as a modal; a deep link has nothing to go back to, so fall back to Home.
function close() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

export function Unavailable() {
  const colors = useColors();
  const { availability, recheck } = useAiAvailability();
  const [checking, setChecking] = useState(false);

  if (availability === null) {
    return null;
  }

  if (availability.status === 'available') {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.paper }}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}
      >
        <ScreenTitle>On-device AI</ScreenTitle>
        <ThemedText variant="title">On-device AI is ready</ThemedText>
        <Button title="Done" onPress={close} />
      </ScrollView>
    );
  }

  const content = reasons[availability.reason];

  const checkAgain = async () => {
    setChecking(true);
    try {
      const result = await recheck();
      if (result.status === 'available') {
        close();
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.paper }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg }}
    >
      <ScreenTitle>On-device AI</ScreenTitle>
      <View style={{ gap: spacing.sm }}>
        <ThemedText variant="title">{content.title}</ThemedText>
        <ThemedText variant="body">{content.body}</ThemedText>
      </View>
      {content.steps.length > 0 ? (
        <Group>
          {content.steps.map((step, index) => (
            <GroupRow key={index} style={{ flexDirection: 'row', gap: spacing.smd }}>
              {content.steps.length > 1 ? (
                <ThemedText variant="headline" tone="primary" style={{ fontVariant: ['tabular-nums'] }}>
                  {index + 1}.
                </ThemedText>
              ) : null}
              <ThemedText variant="body" style={{ flex: 1 }}>
                {step}
              </ThemedText>
            </GroupRow>
          ))}
        </Group>
      ) : null}
      {availability.detail && (__DEV__ || availability.reason === 'unknown') ? (
        <ThemedText variant="caption" tone="muted" selectable>
          {availability.detail}
        </ThemedText>
      ) : null}
      <View style={{ gap: spacing.smd }}>
        {content.canRecheck ? <Button title="Check again" loading={checking} onPress={checkAgain} /> : null}
        <Button title="Continue without AI" variant="secondary" onPress={close} />
      </View>
    </ScrollView>
  );
}
