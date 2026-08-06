import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button, DateTimeField, FormScreen, OptionSelect, TextField, Toggle } from '../src/components';
import { useToast } from '../src/contexts/ToastContext';
import type { ReminderCadence } from '../src/database/models';
import {
  useCreatePersonVaccine,
  useCreatePetVaccine,
  usePersonVaccines,
  usePetVaccines,
  useUpdatePersonVaccine,
  useUpdatePetVaccine,
} from '../src/hooks/useVaccines';
import { useTranslation } from '../src/i18n/useTranslation';
import { todayIso } from '../src/utils/format';
import { useTheme } from '../src/theme/useTheme';
import {
  makeVaccineSchema,
  toPersonVaccineInput,
  toPetVaccineInput,
  type VaccineFormValues,
} from '../src/validations/vaccineSchema';

type Kind = 'person' | 'pet';

/** Create or edit a vaccine for a person (reminder) or a pet (alarm). */
export default function VaccineFormScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { kind, ownerId, id } = useLocalSearchParams<{ kind: Kind; ownerId: string; id?: string }>();
  const isEdit = !!id;
  const isPerson = kind === 'person';

  const personVaccines = usePersonVaccines(isPerson ? ownerId : undefined);
  const petVaccines = usePetVaccines(!isPerson ? ownerId : undefined);
  const existing = id
    ? isPerson
      ? personVaccines.data?.find((v) => v.id === id)
      : petVaccines.data?.find((v) => v.id === id)
    : undefined;

  const createPerson = useCreatePersonVaccine(ownerId);
  const updatePerson = useUpdatePersonVaccine();
  const createPet = useCreatePetVaccine(ownerId);
  const updatePet = useUpdatePetVaccine();

  const { control, handleSubmit, reset } = useForm<VaccineFormValues>({
    resolver: zodResolver(useMemo(() => makeVaccineSchema(t), [t])),
    defaultValues: { name: '', date: todayIso(), reminder: 'once', alarm: true },
  });

  useEffect(() => {
    if (!existing) return;
    reset({
      name: existing.name,
      date: existing.date,
      reminder: 'reminder' in existing ? (existing.reminder as ReminderCadence) : 'once',
      alarm: 'alarm' in existing ? existing.alarm : true,
    });
  }, [existing, reset]);

  const reminderOptions = [
    { value: 'once' as const, label: t('vaccine.remOnce') },
    { value: 'daily' as const, label: t('vaccine.remDaily') },
    { value: 'weekly' as const, label: t('vaccine.remWeekly') },
    { value: 'monthly' as const, label: t('vaccine.remMonthly') },
  ];

  const onSubmit = (values: VaccineFormValues) => {
    const done = (key: 'vaccine.added' | 'vaccine.updated') => {
      showToast(t(key), 'success');
      router.back();
    };
    const onError = (e: Error) => showToast(e.message, 'error');
    if (isPerson) {
      const input = toPersonVaccineInput(values);
      if (isEdit && id) updatePerson.mutate({ id, input }, { onSuccess: () => done('vaccine.updated'), onError });
      else createPerson.mutate(input, { onSuccess: () => done('vaccine.added'), onError });
    } else {
      const input = toPetVaccineInput(values);
      if (isEdit && id) updatePet.mutate({ id, input }, { onSuccess: () => done('vaccine.updated'), onError });
      else createPet.mutate(input, { onSuccess: () => done('vaccine.added'), onError });
    }
  };

  const pending = createPerson.isPending || updatePerson.isPending || createPet.isPending || updatePet.isPending;

  return (
    <FormScreen title={isEdit ? t('vaccine.editTitle') : t('vaccine.newTitle')} onBack={() => router.back()}>
      <Controller control={control} name="name" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('vaccine.name')} icon="vaccines" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="date" render={({ field: { onChange, value }, fieldState }) => (
        <DateTimeField label={t('vaccine.date')} mode="date" value={value} onChange={onChange} error={fieldState.error?.message} />
      )} />

      {isPerson ? (
        <Controller control={control} name="reminder" render={({ field: { onChange, value } }) => (
          <OptionSelect label={t('vaccine.reminder')} options={reminderOptions} value={value} onChange={onChange} />
        )} />
      ) : (
        <Controller control={control} name="alarm" render={({ field: { onChange, value } }) => (
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>{t('vaccine.alarm')}</Text>
            <Toggle value={value} onValueChange={onChange} />
          </View>
        )} />
      )}

      <Button label={t('vaccine.save')} fullWidth loading={pending} onPress={handleSubmit(onSubmit)} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  toggleLabel: { fontSize: 14, fontWeight: '500' },
});
