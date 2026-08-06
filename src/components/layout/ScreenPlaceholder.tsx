import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';

interface ScreenPlaceholderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

/**
 * Temporary themed screen used during Phase 1 to verify navigation and theming.
 * Real screens replace these in later phases.
 */
export function ScreenPlaceholder({ title, subtitle }: ScreenPlaceholderProps) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      <View style={styles.center}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textVar }]}>{subtitle}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { marginTop: 8, fontSize: 14, textAlign: 'center' },
});
