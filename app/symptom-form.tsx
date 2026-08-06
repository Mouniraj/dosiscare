import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Chip, FormScreen, Icon, TextField } from '../src/components';
import { SYMPTOM_KEYS, type SymptomKey } from '../src/constants/symptoms';
import { useToast } from '../src/contexts/ToastContext';
import { useCreateSymptom } from '../src/hooks/useSymptoms';
import { symptomLabel } from '../src/i18n/format';
import { useTranslation } from '../src/i18n/useTranslation';
import { useTheme } from '../src/theme/useTheme';

/** Log symptoms for a persona: predefined chips + custom + temperature + note. */
export default function SymptomFormScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const createSymptom = useCreateSymptom(profileId);

  const [items, setItems] = useState<SymptomKey[]>([]);
  const [custom, setCustom] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [temperature, setTemperature] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleItem = (key: SymptomKey) =>
    setItems((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const addCustom = () => {
    const value = customInput.trim();
    if (value && !custom.includes(value)) setCustom((prev) => [...prev, value]);
    setCustomInput('');
  };

  const onSubmit = () => {
    if (items.length === 0 && custom.length === 0) {
      setError(t('val.symptomRequired'));
      return;
    }
    const tempValue = temperature.trim();
    if (tempValue !== '' && Number.isNaN(Number(tempValue))) {
      setError(t('val.tempInvalid'));
      return;
    }
    createSymptom.mutate(
      {
        items,
        custom,
        temperature: tempValue === '' ? null : Number(tempValue),
        tempUnit: 'C',
        note: note.trim() === '' ? null : note.trim(),
      },
      {
        onSuccess: () => {
          showToast(t('symptom.added'), 'success');
          router.back();
        },
        onError: (e) => showToast(e.message, 'error'),
      },
    );
  };

  return (
    <FormScreen title={t('symptom.newTitle')} onBack={() => router.back()}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textVar }]}>{t('symptom.select')}</Text>
        <View style={styles.chips}>
          {SYMPTOM_KEYS.map((key) => (
            <Chip key={key} label={symptomLabel(t, key)} selected={items.includes(key)} onPress={() => toggleItem(key)} />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textVar }]}>{t('symptom.custom')}</Text>
        <View style={styles.customRow}>
          <View style={styles.customInput}>
            <TextField placeholder={t('symptom.customPlaceholder')} icon="add-circle-outline" value={customInput} onChangeText={setCustomInput} onSubmitEditing={addCustom} returnKeyType="done" />
          </View>
          <Button label={t('common.add')} variant="secondary" onPress={addCustom} />
        </View>
        {custom.length > 0 ? (
          <View style={styles.chips}>
            {custom.map((c) => (
              <Pressable key={c} onPress={() => setCustom((prev) => prev.filter((x) => x !== c))} accessibilityLabel={c}>
                <View style={[styles.customChip, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>{c}</Text>
                  <Icon name="close" size={14} color={theme.colors.primary} />
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <TextField label={t('symptom.temperature')} placeholder="38.5" icon="thermostat" keyboardType="decimal-pad" value={temperature} onChangeText={setTemperature} />
      <TextField label={t('symptom.note')} icon="notes" multiline value={note} onChangeText={setNote} />

      {error ? <Text style={{ color: theme.status.danger, fontSize: 13 }}>{error}</Text> : null}

      <Button label={t('symptom.save')} fullWidth loading={createSymptom.isPending} onPress={onSubmit} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', marginLeft: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  customRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  customInput: { flex: 1 },
  customChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 100 },
});
