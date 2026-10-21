import { ThemedText } from './themed-text';

/** The small uppercase heading above a group, like the section labels on an official form. */
export function SectionLabel({ children }: { children: string }) {
  return (
    <ThemedText variant="label" tone="muted" accessibilityRole="header" style={{ textTransform: 'uppercase' }}>
      {children}
    </ThemedText>
  );
}
