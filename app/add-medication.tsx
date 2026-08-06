import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Header, Icon } from '../src/components';
import type { IconName } from '../src/components';
import { useToast } from '../src/contexts/ToastContext';
import type { OwnerType } from '../src/database/models';
import { useTranslation } from '../src/i18n/useTranslation';
import { useTheme } from '../src/theme/useTheme';

/** "Agregar medicamento": choose how to register the treatment (scan or manual). */
export default function AddMedicationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { ownerType, ownerId } = useLocalSearchParams<{ ownerType: OwnerType; ownerId: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header title={t('addMed.title')} onBack={() => router.back()} />
      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: theme.colors.textVar }]}>{t('addMed.subtitle')}</Text>

        <Option
          icon="document-scanner"
          title={t('addMed.scanTitle')}
          text={t('addMed.scanText')}
          onPress={() => router.push({ pathname: '/scan-prescription', params: { ownerType, ownerId } })}
        />
        <Option
          icon="edit-note"
          title={t('addMed.manualTitle')}
          text={t('addMed.manualText')}
          onPress={() =>
            router.replace({ pathname: '/medication-form', params: { ownerType, ownerId } })
          }
        />
      </View>
    </SafeAreaView>
  );
}

function Option({ icon, title, text, onPress }: { icon: IconName; title: string; text: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card>
        <View style={styles.option}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
            <Icon name={icon} size={26} color={theme.colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.optionSub, { color: theme.colors.textVar }]}>{text}</Text>
          </View>
          <Icon name="chevron-right" size={22} color={theme.colors.textVar} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14 },
  subtitle: { fontSize: 14, marginBottom: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700' },
  optionSub: { fontSize: 13, marginTop: 2 },
});
