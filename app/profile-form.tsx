import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button, FormScreen, TextField } from '../src/components';
import { useToast } from '../src/contexts/ToastContext';
import { useCreateProfile, useProfile, useUpdateProfile } from '../src/hooks/useProfiles';
import { useTranslation } from '../src/i18n/useTranslation';
import { useSessionStore } from '../src/store/sessionStore';
import { makeProfileSchema, toProfileInput, type ProfileFormValues } from '../src/validations/profileSchema';

const EMPTY: ProfileFormValues = { name: '', ageNum: '', weight: '', height: '', allergy: '', role: '' };

/** Create or edit a persona. Presence of an `id` param switches to edit mode. */
export default function ProfileFormScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const { data: existing } = useProfile(id);
  const createProfile = useCreateProfile(userId);
  const updateProfile = useUpdateProfile();

  const { control, handleSubmit, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(useMemo(() => makeProfileSchema(t), [t])),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        ageNum: existing.ageNum?.toString() ?? '',
        weight: existing.weight?.toString() ?? '',
        height: existing.height?.toString() ?? '',
        allergy: existing.allergy ?? '',
        role: existing.role ?? '',
      });
    }
  }, [existing, reset]);

  const onSubmit = (values: ProfileFormValues) => {
    const input = toProfileInput(values);
    const onDone = (messageKey: 'toast.personUpdated' | 'toast.personAdded') => {
      showToast(t(messageKey), 'success');
      router.back();
    };
    if (isEdit && id) {
      updateProfile.mutate({ id, input }, { onSuccess: () => onDone('toast.personUpdated'), onError: (e) => showToast(e.message, 'error') });
    } else {
      createProfile.mutate(input, { onSuccess: () => onDone('toast.personAdded'), onError: (e) => showToast(e.message, 'error') });
    }
  };

  const pending = createProfile.isPending || updateProfile.isPending;

  return (
    <FormScreen title={isEdit ? t('form.editPerson') : t('form.newPerson')} onBack={() => router.back()}>
      <Controller control={control} name="name" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.name')} icon="person" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="ageNum" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.ageYears')} icon="cake" keyboardType="number-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="weight" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.weightKg')} icon="monitor-weight" keyboardType="decimal-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="height" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.heightCm')} icon="height" keyboardType="decimal-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="allergy" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.allergies')} icon="warning-amber" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="role" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.relationship')} icon="family-restroom" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />

      <Button label={t('form.saveProfile')} fullWidth loading={pending} onPress={handleSubmit(onSubmit)} />
    </FormScreen>
  );
}
