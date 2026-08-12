import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '../../src/components';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useSettingsStore } from '../../src/store/settingsStore';
import { lightColors as brand } from '../../src/theme/colors';

/** First-launch welcome. Full-immersive primary background, single CTA → Login. */
export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const markOnboardingSeen = useSettingsStore((s) => s.markOnboardingSeen);

  const onStart = async () => {
    await markOnboardingSeen();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.glass}>
            <Logo size={80} variant="solid" />
          </View>
          <Text style={styles.title}>DosisCare</Text>
          <Text style={styles.tagline}>{t('auth.tagline')}</Text>

          <Pressable
            onPress={onStart}
            accessibilityRole="button"
            accessibilityLabel={t('auth.begin')}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          >
            <Text style={styles.ctaLabel}>{t('auth.begin')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.primary },
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 18,
  },
  glass: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.6,
    marginTop: 4,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 28,
  },
  cta: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 100,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  ctaLabel: {
    color: brand.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
