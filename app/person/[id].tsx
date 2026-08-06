import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DetailRow,
  Divider,
  EmptyState,
  Header,
  Loader,
  MedicationCard,
} from '../../src/components';
import { useToast } from '../../src/contexts/ToastContext';
import type { ReminderCadence } from '../../src/database/models';
import { useDeleteMedication, useMedications, useToggleMedication } from '../../src/hooks/useMedications';
import { useProfile } from '../../src/hooks/useProfiles';
import { useDeleteSymptom, useSymptoms } from '../../src/hooks/useSymptoms';
import { useDeletePersonVaccine, usePersonVaccines } from '../../src/hooks/useVaccines';
import { ageLabel, symptomSummary } from '../../src/i18n/format';
import { useTranslation } from '../../src/i18n/useTranslation';
import type { TFn } from '../../src/i18n';
import { formatDateShort } from '../../src/utils/date';
import { useTheme } from '../../src/theme/useTheme';

type DeleteTarget =
  | { kind: 'med'; id: string; name: string }
  | { kind: 'vaccine'; id: string; name: string }
  | { kind: 'symptom'; id: string; name: string };

const reminderLabel = (t: TFn, r: ReminderCadence): string =>
  t(r === 'daily' ? 'vaccine.remDaily' : r === 'weekly' ? 'vaccine.remWeekly' : r === 'monthly' ? 'vaccine.remMonthly' : 'vaccine.remOnce');

/** Person detail: identity + medications + vaccines, with add/edit/delete. */
export default function PersonDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();

  const { data: profile, isLoading } = useProfile(id);
  const { data: meds = [] } = useMedications('person', id);
  const { data: vaccines = [] } = usePersonVaccines(id);
  const { data: symptoms = [] } = useSymptoms(id);
  const toggle = useToggleMedication();
  const removeMed = useDeleteMedication();
  const removeVaccine = useDeletePersonVaccine();
  const removeSymptom = useDeleteSymptom();

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
        <Header title={t('person.fallback')} onBack={() => router.back()} />
        <Loader />
      </SafeAreaView>
    );
  }

  const goToMedForm = (medId?: string) =>
    router.push({ pathname: '/medication-form', params: { ownerType: 'person', ownerId: profile.id, ...(medId ? { id: medId } : {}) } });
  const goToVaccineForm = (vaccineId?: string) =>
    router.push({ pathname: '/vaccine-form', params: { kind: 'person', ownerId: profile.id, ...(vaccineId ? { id: vaccineId } : {}) } });
  const goToSymptomForm = () => router.push({ pathname: '/symptom-form', params: { profileId: profile.id } });

  const confirmDelete = () => {
    if (deleteTarget?.kind === 'med') {
      removeMed.mutate(deleteTarget.id, {
        onSuccess: () => showToast(t('person.medDeleted'), 'success'),
        onError: (e) => showToast(e.message, 'error'),
      });
    } else if (deleteTarget?.kind === 'vaccine') {
      removeVaccine.mutate(deleteTarget.id, {
        onSuccess: () => showToast(t('vaccine.deleted'), 'success'),
        onError: (e) => showToast(e.message, 'error'),
      });
    } else if (deleteTarget?.kind === 'symptom') {
      removeSymptom.mutate(deleteTarget.id, {
        onSuccess: () => showToast(t('symptom.deleted'), 'success'),
        onError: (e) => showToast(e.message, 'error'),
      });
    }
    setDeleteTarget(null);
  };

  const dialog = ((): { title: string; message: string } => {
    if (deleteTarget?.kind === 'vaccine') return { title: t('vaccine.deleteTitle'), message: t('vaccine.deleteMsg', { name: deleteTarget.name }) };
    if (deleteTarget?.kind === 'symptom') return { title: t('symptom.deleteTitle'), message: t('symptom.deleteMsg') };
    if (deleteTarget?.kind === 'med') return { title: t('person.deleteMedTitle'), message: t('person.deleteMedMsg', { name: deleteTarget.name }) };
    return { title: '', message: '' };
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header
        title={profile.name}
        onBack={() => router.back()}
        actions={[
          {
            icon: 'edit',
            accessibilityLabel: t('person.editPerson'),
            onPress: () => router.push({ pathname: '/profile-form', params: { id: profile.id } }),
          },
        ]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.head}>
            <Avatar initial={profile.initial} color={profile.color} size={56} photoUri={profile.photo} />
            <View style={styles.identity}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{profile.name}</Text>
              <Text style={[styles.meta, { color: theme.colors.textVar }]}>{ageLabel(t, profile.ageNum)}</Text>
            </View>
            {profile.isOwner ? <Badge label={t('menu.titular')} tone="info" /> : null}
          </View>
          <Divider spacing={14} />
          <View style={styles.metrics}>
            <Metric label={t('person.weight')} value={profile.weight ? `${profile.weight} kg` : '—'} />
            <Metric label={t('person.height')} value={profile.height ? `${profile.height} cm` : '—'} />
            <Metric label={t('person.allergies')} value={profile.allergy ?? '—'} />
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('person.activeMeds')}</Text>
        {meds.length === 0 ? (
          <EmptyState icon="medication" title={t('person.noMedsTitle')} message={t('person.noMedsMsg')} actionLabel={t('person.addMed')} onAction={() => router.push({ pathname: '/add-medication', params: { ownerType: 'person', ownerId: profile.id } })} />
        ) : (
          <View style={styles.list}>
            {meds.map((med) => (
              <MedicationCard
                key={med.id}
                medication={med}
                onToggleActive={(isActive) => toggle.mutate({ id: med.id, isActive }, { onError: (e) => showToast(e.message, 'error') })}
                onEdit={() => goToMedForm(med.id)}
                onDelete={() => setDeleteTarget({ kind: 'med', id: med.id, name: med.name })}
              />
            ))}
            <Button label={t('person.addMed')} icon="add" fullWidth onPress={() => router.push({ pathname: '/add-medication', params: { ownerType: 'person', ownerId: profile.id } })} />
          </View>
        )}

        <View style={styles.sectionHeadRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('vaccine.section')}</Text>
        </View>
        {vaccines.length === 0 ? (
          <EmptyState icon="vaccines" title={t('vaccine.section')} message={t('vaccine.empty')} actionLabel={t('vaccine.add')} onAction={() => goToVaccineForm()} />
        ) : (
          <View style={styles.list}>
            {vaccines.map((v) => (
              <DetailRow
                key={v.id}
                icon="vaccines"
                title={v.name}
                subtitle={formatDateShort(v.date)}
                meta={reminderLabel(t, v.reminder)}
                onEdit={() => goToVaccineForm(v.id)}
                onDelete={() => setDeleteTarget({ kind: 'vaccine', id: v.id, name: v.name })}
              />
            ))}
            <Button label={t('vaccine.add')} variant="secondary" icon="add" fullWidth onPress={() => goToVaccineForm()} />
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('symptom.section')}</Text>
        {symptoms.length === 0 ? (
          <EmptyState icon="sick" title={t('symptom.section')} message={t('symptom.empty')} actionLabel={t('symptom.add')} onAction={goToSymptomForm} />
        ) : (
          <View style={styles.list}>
            {symptoms.map((s) => (
              <DetailRow
                key={s.id}
                icon="sick"
                title={symptomSummary(t, s.items, s.custom)}
                subtitle={formatDateShort(new Date(s.loggedAt).toISOString().slice(0, 10))}
                meta={s.temperature ? `${s.temperature}°${s.tempUnit}` : undefined}
                onDelete={() => setDeleteTarget({ kind: 'symptom', id: s.id, name: '' })}
              />
            ))}
            <Button label={t('symptom.add')} variant="secondary" icon="add" fullWidth onPress={goToSymptomForm} />
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={deleteTarget !== null}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={t('common.delete')}
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: theme.colors.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.metricLabel, { color: theme.colors.textVar }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  identity: { flex: 1, gap: 3 },
  name: { fontSize: 18, fontWeight: '800' },
  meta: { fontSize: 13 },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  metric: { flex: 1 },
  metricValue: { fontSize: 14, fontWeight: '700' },
  metricLabel: { fontSize: 11, marginTop: 2 },
  sectionHeadRow: { marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  list: { gap: 14 },
});
