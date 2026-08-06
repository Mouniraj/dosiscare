import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button, FormScreen, OptionSelect, TextField } from '../src/components';
import { PET_TYPES } from '../src/constants/pets';
import { useToast } from '../src/contexts/ToastContext';
import { useCreatePet, usePet, useUpdatePet } from '../src/hooks/usePets';
import { petTypeLabel } from '../src/i18n/format';
import { useTranslation } from '../src/i18n/useTranslation';
import { useSessionStore } from '../src/store/sessionStore';
import { makePetSchema, toPetInput, type PetFormValues } from '../src/validations/petSchema';

const EMPTY: PetFormValues = { name: '', animalType: 'dog', breed: '', age: '', ageUnit: 'y', weight: '' };

/** Create or edit a pet. Presence of an `id` param switches to edit mode. */
export default function PetFormScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const { data: existing } = usePet(id);
  const createPet = useCreatePet(userId);
  const updatePet = useUpdatePet();

  const { control, handleSubmit, reset } = useForm<PetFormValues>({
    resolver: zodResolver(useMemo(() => makePetSchema(t), [t])),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        animalType: (existing.animalType as PetFormValues['animalType']) ?? 'other',
        breed: existing.breed ?? '',
        age: existing.age ?? '',
        ageUnit: existing.ageUnit,
        weight: existing.weight?.toString() ?? '',
      });
    }
  }, [existing, reset]);

  const typeOptions = PET_TYPES.map((p) => ({ value: p.value, label: petTypeLabel(t, p.value) }));
  const unitOptions = [
    { value: 'y' as const, label: t('form.unitYears') },
    { value: 'm' as const, label: t('form.unitMonths') },
  ];

  const onSubmit = (values: PetFormValues) => {
    const input = toPetInput(values);
    const done = (key: 'toast.petUpdated' | 'toast.petAdded') => {
      showToast(t(key), 'success');
      router.back();
    };
    if (isEdit && id) {
      updatePet.mutate({ id, input }, { onSuccess: () => done('toast.petUpdated'), onError: (e) => showToast(e.message, 'error') });
    } else {
      createPet.mutate(input, { onSuccess: () => done('toast.petAdded'), onError: (e) => showToast(e.message, 'error') });
    }
  };

  const pending = createPet.isPending || updatePet.isPending;

  return (
    <FormScreen title={isEdit ? t('form.editPet') : t('form.newPet')} onBack={() => router.back()}>
      <Controller control={control} name="name" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.name')} icon="pets" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="animalType" render={({ field: { onChange, value } }) => (
        <OptionSelect label={t('form.type')} options={typeOptions} value={value} onChange={onChange} />
      )} />
      <Controller control={control} name="breed" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.breed')} icon="sell" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="age" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.age')} icon="cake" keyboardType="number-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="ageUnit" render={({ field: { onChange, value } }) => (
        <OptionSelect label={t('form.ageUnit')} options={unitOptions} value={value} onChange={onChange} />
      )} />
      <Controller control={control} name="weight" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.weightKg')} icon="monitor-weight" keyboardType="decimal-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />

      <Button label={t('form.savePet')} fullWidth loading={pending} onPress={handleSubmit(onSubmit)} />
    </FormScreen>
  );
}
