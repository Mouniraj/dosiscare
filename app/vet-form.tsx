import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button, DateTimeField, FormScreen, TextField } from '../src/components';
import { useToast } from '../src/contexts/ToastContext';
import {
  useCreateVetAppointment,
  useUpdateVetAppointment,
  useVetAppointment,
} from '../src/hooks/useVetAppointments';
import { useTranslation } from '../src/i18n/useTranslation';
import { todayIso } from '../src/utils/format';
import { makeVetSchema, toVetInput, type VetFormValues } from '../src/validations/vetSchema';

/** Create or edit a veterinary appointment. */
export default function VetFormScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { petId, id } = useLocalSearchParams<{ petId: string; id?: string }>();
  const isEdit = !!id;

  const { data: existing } = useVetAppointment(id, petId);
  const createVet = useCreateVetAppointment(petId);
  const updateVet = useUpdateVetAppointment();

  const { control, handleSubmit, reset } = useForm<VetFormValues>({
    resolver: zodResolver(useMemo(() => makeVetSchema(t), [t])),
    defaultValues: { vet: '', date: todayIso(), time: '10:00', description: '' },
  });

  useEffect(() => {
    if (existing) {
      reset({ vet: existing.vet, date: existing.date, time: existing.time, description: existing.description ?? '' });
    }
  }, [existing, reset]);

  const onSubmit = (values: VetFormValues) => {
    const input = toVetInput(values);
    const done = (key: 'vet.updated' | 'vet.added') => {
      showToast(t(key), 'success');
      router.back();
    };
    const onError = (e: Error) => showToast(e.message, 'error');
    if (isEdit && id) updateVet.mutate({ id, input }, { onSuccess: () => done('vet.updated'), onError });
    else createVet.mutate(input, { onSuccess: () => done('vet.added'), onError });
  };

  const pending = createVet.isPending || updateVet.isPending;

  return (
    <FormScreen title={isEdit ? t('vet.editTitle') : t('vet.newTitle')} onBack={() => router.back()}>
      <Controller control={control} name="vet" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('vet.name')} icon="medical-services" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="date" render={({ field: { onChange, value }, fieldState }) => (
        <DateTimeField label={t('vet.date')} mode="date" value={value} onChange={onChange} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="time" render={({ field: { onChange, value }, fieldState }) => (
        <DateTimeField label={t('vet.time')} mode="time" value={value} onChange={onChange} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
        <TextField label={t('vet.description')} icon="notes" multiline value={value} onChangeText={onChange} onBlur={onBlur} />
      )} />

      <Button label={t('vet.save')} fullWidth loading={pending} onPress={handleSubmit(onSubmit)} />
    </FormScreen>
  );
}
