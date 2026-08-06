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
import { useDeleteMedication, useMedications, useToggleMedication } from '../../src/hooks/useMedications';
import { usePet } from '../../src/hooks/usePets';
import { useDeletePetVaccine, usePetVaccines } from '../../src/hooks/useVaccines';
import { useDeleteVetAppointment, useVetAppointments } from '../../src/hooks/useVetAppointments';
import { petAgeLabel, petTypeLabel } from '../../src/i18n/format';
import { useTranslation } from '../../src/i18n/useTranslation';
import { formatDateShort } from '../../src/utils/date';
import { useTheme } from '../../src/theme/useTheme';

type DeleteTarget =
  | { kind: 'med'; id: string; name: string }
  | { kind: 'vaccine'; id: string; name: string }
  | { kind: 'vet'; id: string; name: string };

/** Pet detail: identity + medications + vaccines + vet appointments. */
export default function PetDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();

  const { data: pet, isLoading } = usePet(id);
  const { data: meds = [] } = useMedications('pet', id);
  const { data: vaccines = [] } = usePetVaccines(id);
  const { data: vetAppts = [] } = useVetAppointments(id);
  const toggle = useToggleMedication();
  const removeMed = useDeleteMedication();
  const removeVaccine = useDeletePetVaccine();
  const removeVet = useDeleteVetAppointment();

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  if (isLoading || !pet) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
        <Header title={t('pet.fallback')} onBack={() => router.back()} />
        <Loader />
      </SafeAreaView>
    );
  }

  const goToMedForm = (medId?: string) =>
    router.push({ pathname: '/medication-form', params: { ownerType: 'pet', ownerId: pet.id, ...(medId ? { id: medId } : {}) } });
  const goToVaccineForm = (vaccineId?: string) =>
    router.push({ pathname: '/vaccine-form', params: { kind: 'pet', ownerId: pet.id, ...(vaccineId ? { id: vaccineId } : {}) } });
  const goToVetForm = (vetId?: string) =>
    router.push({ pathname: '/vet-form', params: { petId: pet.id, ...(vetId ? { id: vetId } : {}) } });

  const confirmDelete = () => {
    const onError = (e: Error) => showToast(e.message, 'error');
    if (deleteTarget?.kind === 'med') removeMed.mutate(deleteTarget.id, { onSuccess: () => showToast(t('person.medDeleted'), 'success'), onError });
    else if (deleteTarget?.kind === 'vaccine') removeVaccine.mutate(deleteTarget.id, { onSuccess: () => showToast(t('vaccine.deleted'), 'success'), onError });
    else if (deleteTarget?.kind === 'vet') removeVet.mutate(deleteTarget.id, { onSuccess: () => showToast(t('vet.deleted'), 'success'), onError });
    setDeleteTarget(null);
  };

  const dialog = ((): { title: string; message: string } => {
    if (deleteTarget?.kind === 'vaccine') return { title: t('vaccine.deleteTitle'), message: t('vaccine.deleteMsg', { name: deleteTarget.name }) };
    if (deleteTarget?.kind === 'vet') return { title: t('vet.deleteTitle'), message: t('vet.deleteMsg', { vet: deleteTarget.name }) };
    if (deleteTarget?.kind === 'med') return { title: t('person.deleteMedTitle'), message: t('person.deleteMedMsg', { name: deleteTarget.name }) };
    return { title: '', message: '' };
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header
        title={pet.name}
        onBack={() => router.back()}
        actions={[{ icon: 'edit', accessibilityLabel: t('pet.editPet'), onPress: () => router.push({ pathname: '/pet-form', params: { id: pet.id } }) }]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.head}>
            <Avatar initial={pet.initial} color={pet.color} size={56} photoUri={pet.photo} />
            <View style={styles.identity}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{pet.name}</Text>
              <Text style={[styles.meta, { color: theme.colors.textVar }]}>
                {petTypeLabel(t, pet.animalType)} · {petAgeLabel(t, pet.age, pet.ageUnit)}
              </Text>
            </View>
            <Badge label={petTypeLabel(t, pet.animalType)} tone="info" />
          </View>
          <Divider spacing={14} />
          <View style={styles.metrics}>
            <Metric label={t('person.weight')} value={pet.weight ? `${pet.weight} kg` : '—'} />
            <Metric label={t('pet.race')} value={pet.breed ?? '—'} />
            <Metric label={t('pet.age')} value={petAgeLabel(t, pet.age, pet.ageUnit)} />
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('person.activeMeds')}</Text>
        {meds.length === 0 ? (
          <EmptyState icon="medication" title={t('person.noMedsTitle')} message={t('person.noMedsMsg')} actionLabel={t('person.addMed')} onAction={() => router.push({ pathname: '/add-medication', params: { ownerType: 'pet', ownerId: pet.id } })} />
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
            <Button label={t('person.addMed')} icon="add" fullWidth onPress={() => router.push({ pathname: '/add-medication', params: { ownerType: 'pet', ownerId: pet.id } })} />
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('vaccine.section')}</Text>
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
                meta={v.alarm ? t('vaccine.alarm') : undefined}
                onEdit={() => goToVaccineForm(v.id)}
                onDelete={() => setDeleteTarget({ kind: 'vaccine', id: v.id, name: v.name })}
              />
            ))}
            <Button label={t('vaccine.add')} variant="secondary" icon="add" fullWidth onPress={() => goToVaccineForm()} />
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('vet.section')}</Text>
        {vetAppts.length === 0 ? (
          <EmptyState icon="local-hospital" title={t('vet.section')} message={t('vet.empty')} actionLabel={t('vet.add')} onAction={() => goToVetForm()} />
        ) : (
          <View style={styles.list}>
            {vetAppts.map((a) => (
              <DetailRow
                key={a.id}
                icon="local-hospital"
                title={a.vet}
                subtitle={`${formatDateShort(a.date)} · ${a.time}`}
                onEdit={() => goToVetForm(a.id)}
                onDelete={() => setDeleteTarget({ kind: 'vet', id: a.id, name: a.vet })}
              />
            ))}
            <Button label={t('vet.add')} variant="secondary" icon="add" fullWidth onPress={() => goToVetForm()} />
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
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  list: { gap: 14 },
});
