import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Avatar, Button, Card, Header, Icon, ListItem, Text } from '../../src/components';
import { useToast } from '../../src/contexts/ToastContext';
import { useLogout } from '../../src/hooks/useAuth';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useSessionStore } from '../../src/store/sessionStore';
import { useSyncStore } from '../../src/store/syncStore';
import { useTheme } from '../../src/theme/useTheme';

/** Menú: sincronización, Historial, Ajustes y Compartir cuidado. */
export default function MenuScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useSessionStore((s) => s.user);
  const logout = useLogout();

  const pending = useSyncStore((s) => s.pending);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const refreshPending = useSyncStore((s) => s.refreshPending);
  const syncNow = useSyncStore((s) => s.syncNow);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  const onLogout = () => {
    logout.mutate(undefined, { onSuccess: () => router.replace('/(auth)/login') });
  };

  const onSync = async () => {
    const result = await syncNow();
    showToast(result.offline ? t('sync.offline') : t('sync.done', { count: result.pushed }), result.offline ? 'error' : 'success');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header title={t('menu.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        {user ? (
          <Card style={styles.profile}>
            <Avatar initial={user.name.charAt(0) || '?'} color={theme.colors.primary} size={48} />
            <View style={styles.profileText}>
              <Text variant="heading" numberOfLines={1}>
                {user.name}
              </Text>
              <Text muted numberOfLines={1}>
                {user.role === 'guest' ? t('menu.guestSession') : user.email}
              </Text>
            </View>
          </Card>
        ) : null}

        <Card style={styles.sync}>
          <View style={styles.syncRow}>
            <Icon name={pending > 0 ? 'cloud-upload' : 'cloud-done'} size={22} color={theme.colors.primary} />
            <View style={styles.profileText}>
              <Text variant="label">{t('sync.section')}</Text>
              <Text muted numberOfLines={1}>
                {pending > 0 ? t('sync.pendingCount', { count: pending }) : t('sync.upToDate')}
              </Text>
            </View>
          </View>
          <Button label={t('sync.now')} variant="secondary" size="sm" loading={isSyncing} onPress={onSync} />
        </Card>

        <Text variant="overline" muted style={{ marginTop: 20 }}>
          {t('menu.sections')}
        </Text>
        <View style={styles.group}>
          <ListItem title={t('menu.history')} subtitle={t('menu.historySub')} leadingIcon="history" showChevron onPress={() => router.push('/history')} />
          <ListItem title={t('menu.share')} subtitle={t('menu.shareSub')} leadingIcon="group-add" showChevron onPress={() => {}} />
          <ListItem title={t('menu.settings')} subtitle={t('menu.settingsSub')} leadingIcon="settings" showChevron onPress={() => router.push('/settings')} />
        </View>

        <Text variant="overline" muted style={{ marginTop: 20 }}>
          {t('menu.dev')}
        </Text>
        <View style={styles.group}>
          <ListItem
            title={t('menu.catalog')}
            subtitle={t('menu.catalogSub')}
            leadingIcon="widgets"
            showChevron
            onPress={() => router.push('/catalog')}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <ListItem
            title={t('menu.logout')}
            leadingIcon="logout"
            onPress={onLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  group: { marginTop: 10, gap: 10 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileText: { flex: 1 },
  sync: { marginTop: 12, gap: 12 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
