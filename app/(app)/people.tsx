import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, EmptyState, Header, ListItem, Loader } from '../../src/components';
import { useProfiles } from '../../src/hooks/useProfiles';
import { ageLabel } from '../../src/i18n/format';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useSessionStore } from '../../src/store/sessionStore';
import { useTheme } from '../../src/theme/useTheme';

/** Personas tab: manage the family members (list, add, open detail). */
export default function PeopleScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const { data: profiles = [], isLoading } = useProfiles(user?.id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header
        title={t('people.title')}
        actions={[{ icon: 'add', accessibilityLabel: t('people.add'), onPress: () => router.push('/profile-form') }]}
      />
      {isLoading ? (
        <Loader />
      ) : profiles.length === 0 ? (
        <EmptyState
          icon="group-add"
          title={t('people.emptyTitle')}
          message={t('people.emptyMsg')}
          actionLabel={t('people.add')}
          onAction={() => router.push('/profile-form')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.list}>
            {profiles.map((profile) => (
              <ListItem
                key={profile.id}
                title={profile.name}
                subtitle={`${ageLabel(t, profile.ageNum)}${profile.allergy ? ` · ${t('people.allergyLabel', { value: profile.allergy })}` : ''}`}
                leading={<Avatar initial={profile.initial} color={profile.color} size={44} photoUri={profile.photo} />}
                showChevron
                onPress={() => router.push({ pathname: '/person/[id]', params: { id: profile.id } })}
              />
            ))}
          </View>
          <Button
            label={t('people.add')}
            variant="secondary"
            icon="add"
            fullWidth
            onPress={() => router.push('/profile-form')}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  list: { gap: 10 },
});
