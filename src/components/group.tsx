import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, shadows, spacing, useColors } from '@/theme';

/** A sheet of paper holding related rows, separated by hairlines instead of boxes. */
export function Group({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const rows = Children.toArray(children);

  return (
    <View
      style={[
        {
          backgroundColor: colors.sheet,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          boxShadow: shadows.sheet,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.hairline,
                marginLeft: spacing.md,
              }}
            />
          ) : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

/** Standard padding for a non-interactive row inside a Group. */
export function GroupRow({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ paddingVertical: spacing.smd, paddingHorizontal: spacing.md, gap: spacing.xs }, style]}>
      {children}
    </View>
  );
}
