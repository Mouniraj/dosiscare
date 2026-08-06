import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Header, Icon, OptionSelect, SegmentedControl, Toggle } from '../src/components';
import type { Language } from '../src/constants/config';
import { PROFILE_COLORS } from '../src/constants/profiles';
import { useToast } from '../src/contexts/ToastContext';
import { useTranslation } from '../src/i18n/useTranslation';
import {
  cancelAllNotifications,
  ensureNotificationPermission,
  syncNotifications,
} from '../src/services/NotificationService';
import { useSessionStore } from '../src/store/sessionStore';
import { useSettingsStore } from '../src/store/settingsStore';
import type { ThemeMode } from '../src/theme';
import { useTheme } from '../src/theme/useTheme';

/** Ajustes: language, theme, accent color and sound preferences. */
export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const userId = useSessionStore((s) => s.user?.id);

  const language = useSettingsStore((s) => s.language);
  const themeMode = useSettingsStore((s) => s.theme);
  const accent = useSettingsStore((s) => s.accent);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setAccent = useSettingsStore((s) => s.setAccent);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);

  const onToggleNotifications = async (enabled: boolean) => {
    if (!enabled) {
      await setNotificationsEnabled(false);
      await cancelAllNotifications();
      return;
    }
    const granted = await ensureNotificationPermission();
    if (!granted) {
      showToast(t('notif.permissionDenied'), 'error');
      return;
    }
    await setNotificationsEnabled(true);
    if (userId) await syncNotifications(userId, t);
  };

  const languageOptions: { value: Language; label: string }[] = [
    { value: 'es', label: t('settings.langEs') },
    { value: 'en', label: t('settings.langEn') },
    { value: 'pt', label: t('settings.langPt') },
  ];
  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header title={t('settings.title')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.section, { color: theme.colors.textVar }]}>{t('settings.appearance')}</Text>
        <Card style={styles.group}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('settings.language')}</Text>
            <OptionSelect label="" options={languageOptions} value={language} onChange={setLanguage} />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('settings.theme')}</Text>
            <SegmentedControl options={themeOptions} value={themeMode} onChange={setTheme} />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('settings.accent')}</Text>
            <View style={styles.swatches}>
              {[null, ...PROFILE_COLORS].map((color) => {
                const selected = (accent ?? null) === color;
                return (
                  <Pressable
                    key={color ?? 'default'}
                    onPress={() => setAccent(color)}
                    accessibilityRole="button"
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: color ?? theme.colors.primary,
                        borderColor: selected ? theme.colors.text : 'transparent',
                      },
                    ]}
                  >
                    {selected ? <Icon name="check" size={16} color="#ffffff" /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>

        <Text style={[styles.section, { color: theme.colors.textVar }]}>{t('settings.preferences')}</Text>
        <Card style={styles.group}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('notif.enable')}</Text>
              <Text style={[styles.sub, { color: theme.colors.textVar }]}>{t('notif.enableSub')}</Text>
            </View>
            <Toggle value={notificationsEnabled} onValueChange={onToggleNotifications} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('settings.sounds')}</Text>
              <Text style={[styles.sub, { color: theme.colors.textVar }]}>{t('settings.soundsSub')}</Text>
            </View>
            <Toggle value={soundEnabled} onValueChange={setSoundEnabled} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 10 },
  section: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10 },
  group: { gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 15, fontWeight: '600' },
  sub: { fontSize: 12, marginTop: 2 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleText: { flex: 1 },
});
