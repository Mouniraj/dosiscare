import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreen, BrandMark, Button, Card, Icon } from '../../src/components';
import type { IconName } from '../../src/components';
import { useTranslation } from '../../src/i18n/useTranslation';
import type { TranslationKey } from '../../src/i18n';
import { useSessionStore } from '../../src/store/sessionStore';
import { useTheme } from '../../src/theme/useTheme';

const HIGHLIGHTS: { icon: IconName; titleKey: TranslationKey; textKey: TranslationKey }[] = [
  { icon: 'medication', titleKey: 'auth.hlMedsTitle', textKey: 'auth.hlMedsText' },
  { icon: 'groups', titleKey: 'auth.hlFamilyTitle', textKey: 'auth.hlFamilyText' },
  { icon: 'cloud-off', titleKey: 'auth.hlOfflineTitle', textKey: 'auth.hlOfflineText' },
];

/** Welcome / onboarding shown right after registration. */
export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const userName = useSessionStore((s) => s.user?.name);
  const firstName = userName?.split(' ')[0];

  return (
    <AuthScreen>
      <View style={styles.hero}>
        <BrandMark />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {firstName ? t('auth.welcomeName', { name: firstName }) : t('auth.welcome')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textVar }]}>{t('auth.onboardingSub')}</Text>
      </View>

      <View style={styles.list}>
        {HIGHLIGHTS.map((h) => (
          <Card key={h.titleKey} style={styles.item}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
              <Icon name={h.icon} size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.itemText}>
              <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{t(h.titleKey)}</Text>
              <Text style={[styles.itemSub, { color: theme.colors.textVar }]}>{t(h.textKey)}</Text>
            </View>
          </Card>
        ))}
      </View>

      <Button label={t('auth.start')} fullWidth onPress={() => router.replace('/(app)')} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 10 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  list: { gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 13, marginTop: 2 },
});
