import { type ViewProps, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';

interface CardProps extends ViewProps {
  /** Removes inner padding for cards that manage their own layout. */
  flush?: boolean;
}

/** Surface card: matches the prototype's surface + 1px outline, radius 18. */
export function Card({ flush, style, children, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderRadius: theme.radius.card,
          padding: flush ? 0 : theme.spacing.lg,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
});
