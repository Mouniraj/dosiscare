import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Icon } from '../ui/Icon';

/** DosisCare brand lockup: rounded logo badge + wordmark. */
export function BrandMark({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const theme = useTheme();
  const badge = size === 'lg' ? 64 : 40;
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.badge,
          { width: badge, height: badge, borderRadius: badge * 0.28, backgroundColor: theme.colors.primary },
        ]}
      >
        <Icon name="medication" size={badge * 0.55} color="#ffffff" />
      </View>
      <Text style={[styles.word, { color: theme.colors.text, fontSize: size === 'lg' ? 24 : 18 }]}>
        Dosis<Text style={{ color: theme.colors.primary }}>Care</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  badge: { alignItems: 'center', justifyContent: 'center' },
  word: { fontWeight: '800', letterSpacing: 0.2 },
});
