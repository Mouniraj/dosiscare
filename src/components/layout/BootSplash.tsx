import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Splash shown while the database initializes and settings hydrate on boot.
 * Uses the prototype's brand gradient color as the backdrop.
 */
export function BootSplash() {
  return (
    <View style={styles.root}>
      <Text style={styles.logo}>DosisCare</Text>
      <ActivityIndicator color="#ffffff" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2f6bed' },
  logo: { color: '#ffffff', fontSize: 30, fontWeight: '800', letterSpacing: 0.5 },
  spinner: { marginTop: 20 },
});
