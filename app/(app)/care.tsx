import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppointmentCard,
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Header,
  Icon,
  Loader,
  SegmentedControl,
  Text as ThemedText,
} from '../../src/components';
import type { DoseStatus } from '../../src/database/models';
import type { DoseEvent } from '../../src/services/AgendaService';
import type { DayLog } from '../../src/services/DoseHistoryService';
import { doseStatusLabel } from '../../src/i18n/format';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useToast } from '../../src/contexts/ToastContext';
import { useDayAgenda } from '../../src/hooks/useAgenda';
import { useAppointments, useDeleteAppointment } from '../../src/hooks/useAppointments';
import { useDayLogs, useLogDose, useUndoDose } from '../../src/hooks/useDoseHistory';
import { useSessionStore } from '../../src/store/sessionStore';
import { formatDateLong, isWithinRange } from '../../src/utils/date';
import { todayIso } from '../../src/utils/format';
import { DOSE_STATUS_META, DOSE_STATUSES } from '../../src/utils/medication';
import { useTheme } from '../../src/theme/useTheme';

type CareView = 'day' | 'week' | 'month';

const RANGE_DAYS: Record<CareView, number> = { day: 1, week: 7, month: 30 };

/** Cuidados: today's dose agenda + medical appointments by range. */
export default function CareScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useSessionStore((s) => s.user);
  const today = todayIso();

  const viewOptions = [
    { value: 'day' as const, label: t('care.day') },
    { value: 'week' as const, label: t('care.week') },
    { value: 'month' as const, label: t('care.month') },
  ];
  const apptTitle: Record<CareView, string> = {
    day: t('care.apptsDay'),
    week: t('care.apptsWeek'),
    month: t('care.apptsMonth'),
  };

  const [view, setView] = useState<CareView>('day');
  const { data: agenda = [], isLoading: agendaLoading } = useDayAgenda(user?.id, today);
  const { data: dayLogs = {} } = useDayLogs(user?.id, today);
  const { data: appointments = [], isLoading: apptsLoading } = useAppointments(user?.id);
  const removeAppointment = useDeleteAppointment();
  const logDose = useLogDose();
  const undoDose = useUndoDose();

  const onLogDose = (event: DoseEvent, status: DoseStatus) =>
    logDose.mutate(
      { medicationId: event.medicationId, ownerId: event.ownerId, scheduledAt: event.scheduledAt, status },
      { onSuccess: () => showToast(`${doseStatusLabel(t, status)} ✓`, 'success'), onError: (e) => showToast(e.message, 'error') },
    );

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; doctor: string } | null>(null);

  const rangeAppointments = appointments.filter((a) => isWithinRange(a.date, today, RANGE_DAYS[view]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header
        title={t('care.title')}
        actions={[{ icon: 'add', accessibilityLabel: t('care.scheduleAppt'), onPress: () => router.push('/appointment-form') }]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl options={viewOptions} value={view} onChange={setView} />

        {view === 'day' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('care.todayAgenda')}</Text>
            <Text style={[styles.sectionSub, { color: theme.colors.textVar }]}>{formatDateLong(today)}</Text>
            {agendaLoading ? (
              <Loader fill={false} />
            ) : agenda.length === 0 ? (
              <EmptyState icon="event-available" title={t('care.noDosesTitle')} message={t('care.noDosesMsg')} />
            ) : (
              <Card flush style={styles.agendaCard}>
                {agenda.map((event, i) => (
                  <AgendaRow
                    key={event.key}
                    event={event}
                    last={i === agenda.length - 1}
                    log={dayLogs[event.key]}
                    onLog={(status) => onLogDose(event, status)}
                    onUndo={(logId) => undoDose.mutate(logId)}
                  />
                ))}
              </Card>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{apptTitle[view]}</Text>
          {apptsLoading ? (
            <Loader fill={false} />
          ) : rangeAppointments.length === 0 ? (
            <EmptyState
              icon="event-busy"
              title={t('care.noApptsTitle')}
              message={t('care.noApptsMsg')}
              actionLabel={t('care.scheduleAppt')}
              onAction={() => router.push('/appointment-form')}
            />
          ) : (
            <View style={styles.list}>
              {rangeAppointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onEdit={() => router.push({ pathname: '/appointment-form', params: { id: appt.id } })}
                  onDelete={() => setDeleteTarget({ id: appt.id, doctor: appt.doctor })}
                />
              ))}
              <Button
                label={t('care.scheduleAppt')}
                variant="secondary"
                icon="add"
                fullWidth
                onPress={() => router.push('/appointment-form')}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={deleteTarget !== null}
        title={t('care.deleteApptTitle')}
        message={deleteTarget ? t('care.deleteApptMsg', { doctor: deleteTarget.doctor }) : ''}
        confirmLabel={t('common.delete')}
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            removeAppointment.mutate(deleteTarget.id, {
              onSuccess: () => showToast(t('care.apptDeleted'), 'success'),
              onError: (e) => showToast(e.message, 'error'),
            });
          }
          setDeleteTarget(null);
        }}
      />
    </SafeAreaView>
  );
}

function AgendaRow({
  event,
  last,
  log,
  onLog,
  onUndo,
}: {
  event: DoseEvent;
  last: boolean;
  log?: DayLog;
  onLog: (status: DoseStatus) => void;
  onUndo: (logId: string) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.agendaRow, !last && { borderBottomColor: theme.colors.outline, borderBottomWidth: 1 }]}>
      <View style={styles.agendaTop}>
        <Text style={[styles.agendaTime, { color: theme.colors.primary }]}>{event.time}</Text>
        <View style={styles.agendaBody}>
          <ThemedText variant="label">{event.medicationName}</ThemedText>
          <View style={styles.agendaOwner}>
            <Avatar initial={event.ownerInitial} color={event.ownerColor} size={18} />
            <Text style={[styles.agendaOwnerText, { color: theme.colors.textVar }]}>
              {event.ownerName} · {event.dose}
            </Text>
          </View>
        </View>
        <Icon name={event.ownerType === 'pet' ? 'pets' : 'person'} size={18} color={theme.colors.textVar} />
      </View>

      {log ? (
        <View style={styles.agendaLogged}>
          <Badge label={doseStatusLabel(t, log.status)} tone={DOSE_STATUS_META[log.status].tone} icon={DOSE_STATUS_META[log.status].icon} />
          <Pressable onPress={() => onUndo(log.id)} hitSlop={8} accessibilityLabel={t('care.undo')}>
            <Text style={[styles.undo, { color: theme.colors.primary }]}>{t('care.undo')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.agendaActions}>
          {DOSE_STATUSES.map((status) => {
            const meta = DOSE_STATUS_META[status];
            const label = doseStatusLabel(t, status);
            const color =
              meta.tone === 'ok' ? theme.status.ok : meta.tone === 'danger' ? theme.status.danger : theme.status.warn;
            return (
              <Pressable
                key={status}
                onPress={() => onLog(status)}
                accessibilityLabel={label}
                style={[styles.doseAction, { borderColor: theme.colors.outline }]}
              >
                <Icon name={meta.icon} size={17} color={color} />
                <Text style={[styles.doseActionText, { color: theme.colors.text }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionSub: { fontSize: 13, textTransform: 'capitalize', marginBottom: 6 },
  list: { gap: 14, marginTop: 6 },
  agendaCard: { marginTop: 6 },
  agendaRow: { padding: 14, gap: 12 },
  agendaTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  agendaTime: { fontSize: 15, fontWeight: '800', width: 52 },
  agendaBody: { flex: 1, gap: 4 },
  agendaOwner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  agendaOwnerText: { fontSize: 12 },
  agendaLogged: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  undo: { fontSize: 13, fontWeight: '700' },
  agendaActions: { flexDirection: 'row', gap: 8 },
  doseAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
  },
  doseActionText: { fontSize: 12, fontWeight: '600' },
});
