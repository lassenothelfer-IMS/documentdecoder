import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/button';
import { Group, GroupRow } from '@/components/group';
import { ScreenTitle } from '@/components/screen-title';
import { SectionLabel } from '@/components/section-label';
import { ThemedText } from '@/components/themed-text';
import { insertLetter } from '@/db/letters';
import { sampleLetterText } from '@/dev/sample-letter';
import { explainer, ExplainError, type LetterExplanation } from '@/explainer';
import { useAiAvailability } from '@/hooks/use-ai-availability';
import { spacing, useColors } from '@/theme';
import { getOutputLanguage } from '@/utils/output-language';

type Run =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'done'; explanation: LetterExplanation; elapsedMs: number }
  | { status: 'failed'; code: string; message: string; elapsedMs: number };

/** Developer screen: one real generateObject call against the sample letter, to prove the AI package works. */
export function AiCheck() {
  const colors = useColors();
  const db = useSQLiteContext();
  const { availability, recheck } = useAiAvailability();
  const [run, setRun] = useState<Run>({ status: 'idle' });
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Swiping the modal away must cancel the generation, or expo-ai-kit stays busy until it finishes.
  useEffect(() => () => abortRef.current?.abort(), []);

  const start = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setRun({ status: 'running' });
    const startedAt = Date.now();
    try {
      const explanation = await explainer.explain(sampleLetterText, {
        language: getOutputLanguage(),
        signal: controller.signal,
      });
      setRun({ status: 'done', explanation, elapsedMs: Date.now() - startedAt });
    } catch (error) {
      setRun({
        status: 'failed',
        code: error instanceof ExplainError ? error.code : 'failed',
        message: error instanceof Error ? error.message : String(error),
        elapsedMs: Date.now() - startedAt,
      });
    } finally {
      abortRef.current = null;
    }
  };

  const save = async (explanation: LetterExplanation) => {
    setSaving(true);
    try {
      const id = await insertLetter(db, { source: 'sample', originalText: sampleLetterText, explanation });
      router.replace({ pathname: '/letter/[id]', params: { id: String(id) } });
    } catch (error) {
      setRun({
        status: 'failed',
        code: 'saveFailed',
        message: error instanceof Error ? error.message : String(error),
        elapsedMs: 0,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.paper }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg }}
    >
      <ScreenTitle>AI check</ScreenTitle>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Availability</SectionLabel>
        <Group>
          <GroupRow>
            <ThemedText variant="headline" selectable>
              {availability === null
                ? 'Checking…'
                : availability.status === 'available'
                  ? 'Available'
                  : `Unavailable: ${availability.reason}`}
            </ThemedText>
            {availability?.status === 'unavailable' && availability.detail ? (
              <ThemedText variant="subhead" tone="muted" selectable>
                {availability.detail}
              </ThemedText>
            ) : null}
          </GroupRow>
        </Group>
        <Button title="Check again" variant="secondary" onPress={() => void recheck()} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>Test explanation</SectionLabel>
        <ThemedText variant="subhead" tone="muted">
          Sends the fictional sample letter (a tax reminder, {sampleLetterText.length} characters) to the
          on-device model with the full explanation schema. Output language: {getOutputLanguage()}.
        </ThemedText>
        {run.status === 'running' ? (
          <Button title="Cancel" variant="secondary" onPress={() => abortRef.current?.abort()} />
        ) : (
          <Button title="Run test" onPress={start} />
        )}
        {run.status === 'running' ? (
          <ThemedText variant="subhead" tone="muted">
            Generating… this can take up to a minute.
          </ThemedText>
        ) : null}
      </View>

      {run.status === 'failed' ? (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>{`Failed after ${run.elapsedMs} ms`}</SectionLabel>
          <Group>
            <GroupRow>
              <ThemedText variant="headline" tone="deadline" selectable>
                {run.code}
              </ThemedText>
              <ThemedText variant="body" selectable>
                {run.message}
              </ThemedText>
            </GroupRow>
          </Group>
        </View>
      ) : null}

      {run.status === 'done' ? (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>{`Valid result in ${run.elapsedMs} ms`}</SectionLabel>
          <Group>
            <GroupRow>
              <ThemedText variant="code" selectable>
                {JSON.stringify(run.explanation, null, 2)}
              </ThemedText>
            </GroupRow>
          </Group>
          <Button title="Save to history" variant="secondary" loading={saving} onPress={() => save(run.explanation)} />
        </View>
      ) : null}
    </ScrollView>
  );
}
