import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button, DateTimeField, FormScreen, OptionSelect, TextField } from '../src/components';
import { useToast } from '../src/contexts/ToastContext';
import type { OwnerType } from '../src/database/models';
import { useCreateMedication, useMedication, useUpdateMedication } from '../src/hooks/useMedications';
import { medFormLabel } from '../src/i18n/format';
import { useTranslation } from '../src/i18n/useTranslation';
import { useScanDraftStore } from '../src/store/scanDraftStore';
import { MEDICATION_FORMS } from '../src/utils/medication';
import { todayIso } from '../src/utils/format';
import { makeMedicationSchema, toMedicationInput, type MedicationFormValues } from '../src/validations/medicationSchema';

const EMPTY: MedicationFormValues = {
  name: '',
  form: 'pill',
  dose: '',
  intervalHours: '8',
  startTime: '08:00',
  durationDays: '7',
  treatmentKind: 'temporary',
};

/** Create or edit a medication for a person or pet (manual entry). */
export default function MedicationFormScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { ownerType, ownerId, id } = useLocalSearchParams<{
    ownerType: OwnerType;
    ownerId: string;
    id?: string;
  }>();
  const isEdit = !!id;

  const { data: existing } = useMedication(id);
  const createMedication = useCreateMedication(ownerType, ownerId);
  const updateMedication = useUpdateMedication();
  const consumeDraft = useScanDraftStore((s) => s.consumeDraft);

  const { control, handleSubmit, reset } = useForm<MedicationFormValues>({
    resolver: zodResolver(useMemo(() => makeMedicationSchema(t), [t])),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        form: existing.form,
        dose: existing.dose,
        intervalHours: existing.intervalHours.toString(),
        startTime: existing.startTime,
        durationDays: existing.durationDays.toString(),
        treatmentKind: existing.treatmentKind,
      });
    }
  }, [existing, reset]);

  // Prefill from a scanned-prescription draft (create mode only).
  useEffect(() => {
    if (!id) {
      const draft = consumeDraft();
      if (draft) reset(draft);
    }
  }, [id, consumeDraft, reset]);

  const formOptions = MEDICATION_FORMS.map((f) => ({ value: f.value, label: medFormLabel(t, f.value) }));
  const kindOptions = [
    { value: 'temporary' as const, label: t('form.temporary') },
    { value: 'permanent' as const, label: t('form.permanent') },
  ];

  const onSubmit = (values: MedicationFormValues) => {
    const input = toMedicationInput(values, existing?.startDate ?? todayIso());
    const done = (key: 'toast.medUpdated' | 'toast.medAdded') => {
      showToast(t(key), 'success');
      router.back();
    };
    if (isEdit && id) {
      updateMedication.mutate({ id, input }, { onSuccess: () => done('toast.medUpdated'), onError: (e) => showToast(e.message, 'error') });
    } else {
      createMedication.mutate(input, { onSuccess: () => done('toast.medAdded'), onError: (e) => showToast(e.message, 'error') });
    }
  };

  const pending = createMedication.isPending || updateMedication.isPending;

  return (
    <FormScreen title={isEdit ? t('form.editMed') : t('form.newMed')} onBack={() => router.back()}>
      <Controller control={control} name="name" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.medication')} icon="medication" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="form" render={({ field: { onChange, value } }) => (
        <OptionSelect label={t('form.presentation')} options={formOptions} value={value} onChange={onChange} />
      )} />
      <Controller control={control} name="dose" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.dosePerTake')} icon="colorize" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="intervalHours" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.everyHours')} icon="schedule" keyboardType="number-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="startTime" render={({ field: { onChange, value }, fieldState }) => (
        <DateTimeField label={t('form.startTime')} mode="time" icon="alarm" value={value} onChange={onChange} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="treatmentKind" render={({ field: { onChange, value } }) => (
        <OptionSelect label={t('form.treatmentType')} options={kindOptions} value={value} onChange={onChange} />
      )} />
      <Controller control={control} name="durationDays" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.durationDays')} icon="event-repeat" keyboardType="number-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />

      <Button label={t('form.save')} fullWidth loading={pending} onPress={handleSubmit(onSubmit)} />
    </FormScreen>
  );
}
