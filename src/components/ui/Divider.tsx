import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';

/** Hairline separator using the theme outline color. */
export function Divider({ spacing = 0 }: { spacing?: number }) {
  const theme = useTheme();
  return <View style={[styles.line, { backgroundColor: theme.colors.outline, marginVertical: spacing }]} />;
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, width: '100%' },
});
