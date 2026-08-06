import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, Loader, ProfileCard } from '../../src/components';
import { useProfiles } from '../../src/hooks/useProfiles';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useSessionStore } from '../../src/store/sessionStore';
import { useTheme } from '../../src/theme/useTheme';

/** Home dashboard: greeting + "¿A quién cuidamos hoy?" persona cards. */
export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const { data: profiles = [], isLoading, refetch, isRefetching } = useProfiles(user?.id);

  const firstName = user?.name?.split(' ')[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
      >
        <View>
          <Text style={[styles.hello, { color: theme.colors.textVar }]}>
            {t('home.hello')}{firstName ? ',' : ''}
          </Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>{firstName ?? t('home.welcome')}</Text>
        </View>

        <Text style={[styles.section, { color: theme.colors.text }]}>{t('home.whoToday')}</Text>

        {isLoading ? (
          <Loader />
        ) : profiles.length === 0 ? (
          <EmptyState
            icon="group-add"
            title={t('home.emptyTitle')}
            message={t('home.emptyMsg')}
            actionLabel={t('home.addPerson')}
            onAction={() => router.push('/profile-form')}
          />
        ) : (
          <View style={styles.list}>
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onPress={() => router.push({ pathname: '/person/[id]', params: { id: profile.id } })}
              />
            ))}
            <Button
              label={t('home.addPerson')}
              variant="secondary"
              icon="add"
              fullWidth
              onPress={() => router.push('/profile-form')}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 18 },
  hello: { fontSize: 14 },
  name: { fontSize: 26, fontWeight: '800', marginTop: 2 },
  section: { fontSize: 17, fontWeight: '800' },
  list: { gap: 14 },
});
