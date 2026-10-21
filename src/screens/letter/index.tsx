import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/button';
import { Group, GroupRow } from '@/components/group';
import { ScreenTitle } from '@/components/screen-title';
import { SectionLabel } from '@/components/section-label';
import { ThemedText } from '@/components/themed-text';
import { letterTypeLabels } from '@/constants/letter-types';
import type { Letter } from '@/db/letters';
import type { LetterExplanation } from '@/explainer/schema';
import { useLetter } from '@/hooks/use-letters';
import { formatLongDate, parseIsoDate } from '@/utils/dates';
import { formatAmount } from '@/utils/money';
import { spacing, useColors } from '@/theme';

export function LetterScreen({ id }: { id: number }) {
  const colors = useColors();
  const { state, reload } = useLetter(id);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.paper }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg }}
    >
      {state.status === 'loading' ? null : state.status === 'error' ? (
        <View style={{ gap: spacing.smd }}>
          <ScreenTitle>Letter</ScreenTitle>
          <ThemedText variant="body" selectable>
            This letter couldn’t be loaded. {state.error.message}
          </ThemedText>
          <Button title="Try again" variant="secondary" onPress={reload} />
        </View>
      ) : state.data === null ? (
        <>
          <ScreenTitle>Letter</ScreenTitle>
          <ThemedText variant="body" tone="muted">
            This letter no longer exists. It may have been deleted.
          </ThemedText>
        </>
      ) : (
        <LetterContent letter={state.data} />
      )}
    </ScrollView>
  );
}

function LetterContent({ letter }: { letter: Letter }) {
  const explanation = letter.explanation;

  return (
    <>
      <ScreenTitle>{explanation?.sender ?? 'Letter'}</ScreenTitle>
      <View style={{ gap: spacing.xs }}>
        <ThemedText variant="label" tone="muted" style={{ textTransform: 'uppercase' }}>
          {explanation ? letterTypeLabels[explanation.letterType] : 'Not explained yet'} · Saved{' '}
          {formatLongDate(letter.createdAt)}
        </ThemedText>
        <ThemedText variant="title" selectable>
          {explanation?.sender ?? 'Letter without explanation'}
        </ThemedText>
        {explanation ? (
          <ThemedText variant="caption" tone="muted">
            AI generated explanation. Not legal advice. Check important details in the original below.
          </ThemedText>
        ) : null}
      </View>
      {explanation ? <Explanation explanation={explanation} /> : null}
      <OriginalText text={letter.originalText} initiallyOpen={!explanation} />
    </>
  );
}

function Explanation({ explanation }: { explanation: LetterExplanation }) {
  return (
    <>
      <View style={{ gap: spacing.sm }}>
        <SectionLabel>What you need to do</SectionLabel>
        <Group>
          {explanation.actionRequired && explanation.actions.length === 0 ? (
            <GroupRow>
              <ThemedText variant="body">
                Something needs to be done, but the steps are unclear. Read the original letter.
              </ThemedText>
            </GroupRow>
          ) : explanation.actionRequired ? (
            explanation.actions.map((action, index) => (
              <GroupRow key={index} style={{ flexDirection: 'row', gap: spacing.smd }}>
                <ThemedText variant="headline" tone="primary" style={{ fontVariant: ['tabular-nums'] }}>
                  {index + 1}.
                </ThemedText>
                <ThemedText variant="body" style={{ flex: 1 }} selectable>
                  {action.step}
                </ThemedText>
              </GroupRow>
            ))
          ) : (
            <GroupRow>
              <ThemedText variant="body">Nothing. This letter is for your information.</ThemedText>
            </GroupRow>
          )}
        </Group>
      </View>

      {explanation.deadlines.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>Deadlines</SectionLabel>
          <Group>
            {explanation.deadlines.map((deadline, index) => {
              const date = parseIsoDate(deadline.date);
              return (
                <GroupRow key={index}>
                  <ThemedText variant="headline" tone="deadline" selectable>
                    {date ? formatLongDate(date) : deadline.date}
                  </ThemedText>
                  <ThemedText variant="body" selectable>
                    {deadline.what}
                  </ThemedText>
                </GroupRow>
              );
            })}
          </Group>
        </View>
      ) : null}

      {explanation.amounts.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>Amounts</SectionLabel>
          <Group>
            {explanation.amounts.map((amount, index) => (
              <GroupRow key={index} style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.smd }}>
                <ThemedText variant="body" style={{ flex: 1 }} selectable>
                  {amount.purpose}
                </ThemedText>
                <ThemedText variant="headline" style={{ fontVariant: ['tabular-nums'] }} selectable>
                  {formatAmount(amount.value, amount.currency)}
                </ThemedText>
              </GroupRow>
            ))}
          </Group>
        </View>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <SectionLabel>In short</SectionLabel>
        <ThemedText variant="body" selectable>
          {explanation.summary}
        </ThemedText>
      </View>

      {explanation.glossary.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionLabel>Words in this letter</SectionLabel>
          <Group>
            {explanation.glossary.map((entry, index) => (
              <GroupRow key={index}>
                <ThemedText variant="headline" selectable>
                  {entry.term}
                </ThemedText>
                <ThemedText variant="subhead" tone="muted" selectable>
                  {entry.explanation}
                </ThemedText>
              </GroupRow>
            ))}
          </Group>
        </View>
      ) : null}
    </>
  );
}

function OriginalText({ text, initiallyOpen }: { text: string; initiallyOpen: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <View style={{ gap: spacing.sm }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        hitSlop={spacing.sm}
      >
        {({ pressed }) => (
          <ThemedText variant="headline" tone="primary" style={{ opacity: pressed ? 0.6 : 1 }}>
            {open ? 'Hide original letter' : 'Show original letter'}
          </ThemedText>
        )}
      </Pressable>
      {open ? (
        <Group>
          <GroupRow style={{ paddingVertical: spacing.md }}>
            <ThemedText variant="letter" selectable>
              {text}
            </ThemedText>
          </GroupRow>
        </Group>
      ) : null}
    </View>
  );
}
