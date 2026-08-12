import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Logo } from './Logo';

/** DosisCare brand lockup: Monograma D · latido + wordmark. */
export function BrandMark({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const theme = useTheme();
  const badge = size === 'lg' ? 72 : 44;
  return (
    <View style={styles.wrap}>
      <Logo size={badge} variant="solid" />
      <Text style={[styles.word, { color: theme.colors.text, fontSize: size === 'lg' ? 26 : 18 }]}>
        Dosis
        <Text style={{ color: theme.colors.textVar, fontWeight: '500' }}>Care</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  word: { fontWeight: '800', letterSpacing: -0.6 },
});
