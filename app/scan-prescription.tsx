import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Header, Icon, Loader } from '../src/components';
import { useToast } from '../src/contexts/ToastContext';
import type { OwnerType } from '../src/database/models';
import { useTranslation } from '../src/i18n/useTranslation';
import { PrescriptionScanService } from '../src/services/PrescriptionScanService';
import { useScanDraftStore } from '../src/store/scanDraftStore';
import { useTheme } from '../src/theme/useTheme';

type Source = 'camera' | 'gallery';

/** Prescription scan: pick a photo, "read" it (simulated AI), prefill the med form. */
export default function ScanPrescriptionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { ownerType, ownerId } = useLocalSearchParams<{ ownerType: OwnerType; ownerId: string }>();
  const setDraft = useScanDraftStore((s) => s.setDraft);

  const [analyzing, setAnalyzing] = useState(false);

  const pick = async (source: Source) => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast(t('scan.permission'), 'error');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, mediaTypes: ['images'] });
    if (result.canceled) return;

    setAnalyzing(true);
    try {
      const draft = await PrescriptionScanService.scan(result.assets[0].uri);
      setDraft(draft);
      showToast(t('scan.draftReady'), 'success');
      router.replace({ pathname: '/medication-form', params: { ownerType, ownerId } });
    } catch {
      showToast(t('addMed.scanSoon'), 'error');
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header title={t('scan.title')} onBack={() => router.back()} />
      <View style={styles.content}>
        {analyzing ? (
          <View style={styles.analyzing}>
            <Loader fill={false} />
            <Text style={[styles.analyzingTitle, { color: theme.colors.text }]}>{t('scan.analyzing')}</Text>
            <Text style={[styles.analyzingSub, { color: theme.colors.textVar }]}>{t('scan.analyzingSub')}</Text>
          </View>
        ) : (
          <>
            <View style={[styles.frame, { borderColor: theme.colors.primary }]}>
              <Icon name="document-scanner" size={54} color={theme.colors.primary} />
              <Text style={[styles.hint, { color: theme.colors.textVar }]}>{t('scan.hint')}</Text>
            </View>
            <View style={styles.actions}>
              <Button label={t('scan.takePhoto')} icon="photo-camera" fullWidth onPress={() => pick('camera')} />
              <Button label={t('scan.gallery')} variant="secondary" icon="photo-library" fullWidth onPress={() => pick('gallery')} />
            </View>
            <Text style={[styles.note, { color: theme.colors.textVar }]}>{t('scan.note')}</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20, gap: 20 },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  hint: { fontSize: 14, textAlign: 'center' },
  actions: { gap: 12 },
  note: { fontSize: 12, textAlign: 'center' },
  analyzing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  analyzingTitle: { fontSize: 17, fontWeight: '800', marginTop: 8 },
  analyzingSub: { fontSize: 14, textAlign: 'center' },
});
