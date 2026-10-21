import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ScreenTitle } from '@/components/screen-title';
import { SectionLabel } from '@/components/section-label';
import { ThemedText } from '@/components/themed-text';
import { insertLetter } from '@/db/letters';
import { sampleLetterExplanation, sampleLetterText } from '@/dev/sample-letter';
import { useAiAvailability } from '@/hooks/use-ai-availability';
import { useLetters, type LoadState } from '@/hooks/use-letters';
import { useToday } from '@/hooks/use-today';
import { spacing, useColors } from '@/theme';

import { AiNotice } from './ai-notice';
import { LetterRow } from './letter-row';
import { SettingsButton } from './settings-button';

// The unavailable screen opens by itself once per launch; after that the notice on Home stays.
let unavailableScreenShown = false;

export function Home() {
  const colors = useColors();
  const { availability } = useAiAvailability();
  const { state, reload } = useLetters();
  const today = useToday();

  useEffect(() => {
    if (availability?.status === 'unavailable' && !unavailableScreenShown) {
      unavailableScreenShown = true;
      router.push('/unavailable');
    }
  }, [availability]);

  const letters = state.status === 'ready' ? state.data : [];

  return (
    <>
      <ScreenTitle large>Brieflos</ScreenTitle>
      <SettingsButton />
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.paper }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        data={letters}
        keyExtractor={(letter) => String(letter.id)}
        renderItem={({ item, index }) => (
          <LetterRow letter={item} isFirst={index === 0} isLast={index === letters.length - 1} today={today} />
        )}
        ItemSeparatorComponent={() => (
          <View style={{ backgroundColor: colors.sheet }}>
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.hairline,
                marginLeft: spacing.md,
              }}
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={{ gap: spacing.lg, paddingBottom: spacing.smd }}>
            <ThemedText variant="subhead" tone="muted">
              Scan an official letter and get a plain explanation of what it says, what you need to do,
              and by when. Everything stays on this device.
            </ThemedText>
            <View style={{ gap: spacing.smd }}>
              {/* Capture arrives in M2 (scanner, photo and PDF import). */}
              <Button title="Scan letter" icon="doc.viewfinder" size="lg" disabled />
              <Button title="Import PDF or photo" icon="square.and.arrow.down" variant="secondary" disabled />
              <ThemedText variant="caption" tone="muted" style={{ textAlign: 'center' }}>
                Scanning and import are coming in the next build.
              </ThemedText>
            </View>
            {availability?.status === 'unavailable' ? <AiNotice /> : null}
            <View style={{ paddingTop: spacing.sm }}>
              <SectionLabel>Your letters</SectionLabel>
            </View>
          </View>
        }
        ListEmptyComponent={<HistoryEmpty state={state} onChange={reload} />}
      />
    </>
  );
}

function HistoryEmpty({ state, onChange }: { state: LoadState<unknown>; onChange: () => void }) {
  const db = useSQLiteContext();
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Never show "no letters" while the first read is still running.
  if (state.status === 'loading') {
    return null;
  }

  if (state.status === 'error') {
    return (
      <View style={{ gap: spacing.smd, paddingVertical: spacing.md }}>
        <ThemedText variant="body" selectable>
          Your letters couldn’t be loaded. {state.error.message}
        </ThemedText>
        <Button title="Try again" variant="secondary" onPress={onChange} />
      </View>
    );
  }

  const addSample = async () => {
    setAdding(true);
    setAddError(null);
    try {
      await insertLetter(db, {
        source: 'sample',
        originalText: sampleLetterText,
        explanation: sampleLetterExplanation,
      });
      onChange();
    } catch (error) {
      setAddError(error instanceof Error ? error.message : String(error));
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={{ gap: spacing.smd, paddingVertical: spacing.md }}>
      <ThemedText variant="body" tone="muted">
        No letters yet. Letters you decode are kept here, only on this device.
      </ThemedText>
      {__DEV__ ? (
        <Button title="Add sample letter (dev)" variant="secondary" loading={adding} onPress={addSample} />
      ) : null}
      {addError ? (
        <ThemedText variant="subhead" tone="deadline" selectable>
          {addError}
        </ThemedText>
      ) : null}
    </View>
  );
}
