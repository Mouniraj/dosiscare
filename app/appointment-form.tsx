import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button, DateTimeField, FormScreen, OptionSelect, TextField, Toggle } from '../src/components';
import { useToast } from '../src/contexts/ToastContext';
import type { OwnerType } from '../src/database/models';
import { useAppointment, useCreateAppointment, useUpdateAppointment } from '../src/hooks/useAppointments';
import { useProfiles } from '../src/hooks/useProfiles';
import { useTranslation } from '../src/i18n/useTranslation';
import { useSessionStore } from '../src/store/sessionStore';
import { todayIso } from '../src/utils/format';
import { useTheme } from '../src/theme/useTheme';
import {
  makeAppointmentSchema,
  toAppointmentInput,
  type AppointmentFormValues,
} from '../src/validations/appointmentSchema';

const emptyValues = (): AppointmentFormValues => ({
  profileId: '',
  doctor: '',
  date: todayIso(),
  time: '10:00',
  remindDay: true,
  remindHour: true,
  remindAt: false,
  notes: '',
});

/** Create or edit a medical appointment. */
export default function AppointmentFormScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const userId = useSessionStore((s) => s.user?.id);
  const { data: profiles = [] } = useProfiles(userId);
  const { data: existing } = useAppointment(id);
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const { control, handleSubmit, reset, watch, setValue } = useForm<AppointmentFormValues>({
    resolver: zodResolver(useMemo(() => makeAppointmentSchema(t), [t])),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (existing) {
      reset({
        profileId: existing.profileId,
        doctor: existing.doctor,
        date: existing.date,
        time: existing.time,
        remindDay: existing.remindDay,
        remindHour: existing.remindHour,
        remindAt: existing.remindAt,
        notes: existing.notes ?? '',
      });
    }
  }, [existing, reset]);

  useEffect(() => {
    if (!isEdit && !watch('profileId') && profiles.length > 0) {
      setValue('profileId', profiles[0].id);
    }
  }, [isEdit, profiles, setValue, watch]);

  const onSubmit = (values: AppointmentFormValues) => {
    const input = toAppointmentInput(values);
    const done = (key: 'toast.apptUpdated' | 'toast.apptAdded') => {
      showToast(t(key), 'success');
      router.back();
    };
    if (isEdit && id) {
      updateAppointment.mutate({ id, input }, { onSuccess: () => done('toast.apptUpdated'), onError: (e) => showToast(e.message, 'error') });
    } else {
      createAppointment.mutate(input, { onSuccess: () => done('toast.apptAdded'), onError: (e) => showToast(e.message, 'error') });
    }
  };

  const pending = createAppointment.isPending || updateAppointment.isPending;
  const profileOptions = profiles.map((p) => ({ value: p.id, label: p.name }));

  return (
    <FormScreen title={isEdit ? t('form.editAppt') : t('form.newAppt')} onBack={() => router.back()}>
      <Controller control={control} name="profileId" render={({ field: { onChange, value }, fieldState }) => (
        <View style={styles.field}>
          <OptionSelect label={t('form.person')} options={profileOptions} value={value} onChange={onChange} />
          {fieldState.error ? <ErrorText message={fieldState.error.message} /> : null}
        </View>
      )} />
      <Controller control={control} name="doctor" render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField label={t('form.doctor')} icon="medical-services" value={value} onChangeText={onChange} onBlur={onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="date" render={({ field: { onChange, value }, fieldState }) => (
        <DateTimeField label={t('form.date')} mode="date" value={value} onChange={onChange} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="time" render={({ field: { onChange, value }, fieldState }) => (
        <DateTimeField label={t('form.time')} mode="time" value={value} onChange={onChange} error={fieldState.error?.message} />
      )} />

      <View style={styles.reminders}>
        <ReminderToggle control={control} name="remindDay" label={t('form.remindDay')} />
        <ReminderToggle control={control} name="remindHour" label={t('form.remindHour')} />
        <ReminderToggle control={control} name="remindAt" label={t('form.remindAt')} />
      </View>

      <Controller control={control} name="notes" render={({ field: { onChange, onBlur, value } }) => (
        <TextField label={t('form.notesOptional')} icon="notes" multiline value={value} onChangeText={onChange} onBlur={onBlur} />
      )} />

      <Button label={t('form.saveAppt')} fullWidth loading={pending} onPress={handleSubmit(onSubmit)} />
    </FormScreen>
  );
}

function ReminderToggle({
  control,
  name,
  label,
}: {
  control: ReturnType<typeof useForm<AppointmentFormValues>>['control'];
  name: 'remindDay' | 'remindHour' | 'remindAt';
  label: string;
}) {
  const theme = useTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>{label}</Text>
          <Toggle value={value} onValueChange={onChange} />
        </View>
      )}
    />
  );
}

function ErrorText({ message }: { message?: string }) {
  const theme = useTheme();
  if (!message) return null;
  return <Text style={{ color: theme.status.danger, fontSize: 12, marginLeft: 2 }}>{message}</Text>;
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  reminders: { gap: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  toggleLabel: { fontSize: 14, fontWeight: '500' },
});
