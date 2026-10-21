import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { letterTypeLabels } from '@/constants/letter-types';
import type { LetterSummary } from '@/db/letters';
import { formatShortDate, nextDeadline } from '@/utils/dates';
import { radius, spacing, useColors } from '@/theme';

export function LetterRow({
  letter,
  isFirst,
  isLast,
  today,
}: {
  letter: LetterSummary;
  isFirst: boolean;
  isLast: boolean;
  today: Date;
}) {
  const colors = useColors();
  const explanation = letter.explanation;
  const deadline = explanation ? nextDeadline(explanation.deadlines, today) : null;
  const title = explanation?.sender ?? 'Letter without explanation';
  const kind = explanation ? letterTypeLabels[explanation.letterType] : 'Not explained yet';

  return (
    <Link href={{ pathname: '/letter/[id]', params: { id: String(letter.id) } }} asChild>
      {/* Styles live on the inner View: Link's asChild doesn't forward a Pressable style function on web. */}
      <Pressable accessibilityRole="link">
        {({ pressed }) => (
          <View
            style={{
              backgroundColor: pressed ? colors.primarySoft : colors.sheet,
              borderTopLeftRadius: isFirst ? radius.lg : 0,
              borderTopRightRadius: isFirst ? radius.lg : 0,
              borderBottomLeftRadius: isLast ? radius.lg : 0,
              borderBottomRightRadius: isLast ? radius.lg : 0,
              borderCurve: 'continuous',
              paddingVertical: spacing.smd,
              paddingHorizontal: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.smd,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText variant="headline" numberOfLines={1}>
                {title}
              </ThemedText>
              <ThemedText variant="caption" tone="muted" numberOfLines={1}>
                {kind} · {formatShortDate(letter.createdAt)}
              </ThemedText>
            </View>
            {deadline ? (
              <View
                style={{
                  backgroundColor: colors.deadlineSoft,
                  borderRadius: radius.sm,
                  borderCurve: 'continuous',
                  paddingVertical: 2,
                  paddingHorizontal: spacing.sm,
                }}
              >
                <ThemedText variant="label" tone="deadline" style={{ fontVariant: ['tabular-nums'] }}>
                  Due {formatShortDate(deadline.parsedDate)}
                </ThemedText>
              </View>
            ) : explanation?.actionRequired ? (
              <ThemedText variant="label" tone="primary">
                Action needed
              </ThemedText>
            ) : null}
          </View>
        )}
      </Pressable>
    </Link>
  );
}
