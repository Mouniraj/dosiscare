import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';

/** Centered loading spinner using the theme accent. */
export function Loader({ fill = true }: { fill?: boolean }) {
  const theme = useTheme();
  return (
    <View style={fill ? styles.fill : styles.inline}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inline: { paddingVertical: 24, alignItems: 'center' },
});
