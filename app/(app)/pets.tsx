import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, Header, Loader, PetCard } from '../../src/components';
import { usePets } from '../../src/hooks/usePets';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useSessionStore } from '../../src/store/sessionStore';
import { useTheme } from '../../src/theme/useTheme';

/** Mascotas tab: manage pets (list, add, open detail). */
export default function PetsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const { data: pets = [], isLoading, refetch, isRefetching } = usePets(user?.id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header
        title={t('pets.title')}
        actions={[{ icon: 'add', accessibilityLabel: t('pets.add'), onPress: () => router.push('/pet-form') }]}
      />
      {isLoading ? (
        <Loader />
      ) : pets.length === 0 ? (
        <EmptyState
          icon="pets"
          title={t('pets.emptyTitle')}
          message={t('pets.emptyMsg')}
          actionLabel={t('pets.add')}
          onAction={() => router.push('/pet-form')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
        >
          <View style={styles.list}>
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onPress={() => router.push({ pathname: '/pet/[id]', params: { id: pet.id } })}
              />
            ))}
          </View>
          <Button label={t('pets.add')} variant="secondary" icon="add" fullWidth onPress={() => router.push('/pet-form')} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  list: { gap: 14 },
});
