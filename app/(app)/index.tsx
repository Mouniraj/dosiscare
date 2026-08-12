import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, EmptyState, Icon, Loader } from '../../src/components';
import type { IconName } from '../../src/components/ui/Icon';
import type { DoseStatus } from '../../src/database/models';
import type { DoseEvent } from '../../src/services/AgendaService';
import type { DayLog } from '../../src/services/DoseHistoryService';
import { useAppointments } from '../../src/hooks/useAppointments';
import { useDayAgenda, useRangeAgenda } from '../../src/hooks/useAgenda';
import { useDayLogs } from '../../src/hooks/useDoseHistory';
import { useProfiles } from '../../src/hooks/useProfiles';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useSessionStore } from '../../src/store/sessionStore';
import { useTheme } from '../../src/theme/useTheme';
import {
  addDaysIso,
  formatDateFullYear,
  greetingKey,
  isTodayIso,
  mondayOfWeek,
  weekdayShort,
} from '../../src/utils/date';
import { todayIso } from '../../src/utils/format';
import { iconForForm } from '../../src/utils/medication';

/** Home dashboard: greeting + weekday strip + day agenda + appointments. */
export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const today = todayIso();
  const [selected, setSelected] = useState<string>(today);

  const { isLoading: profilesLoading, refetch, isRefetching } = useProfiles(user?.id);
  const { data: agenda = [], isLoading: agendaLoading } = useDayAgenda(user?.id, selected);
  const { data: dayLogs = {} } = useDayLogs(user?.id, selected);
  const { data: appointments = [] } = useAppointments(user?.id);

  const monday = useMemo(() => mondayOfWeek(selected), [selected]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysIso(monday, i)),
    [monday],
  );
  const { data: byDay = {} } = useRangeAgenda(user?.id, monday, 7);

  const displayName = user?.name?.trim() || t('home.welcome');
  const greeting = t(`home.${greetingKey()}`);
  const dateLabel = formatDateFullYear(selected);

  const pendingCount = agenda.filter((e) => !dayLogs[e.key]).length;
  const pendingLabel =
    pendingCount === 0
      ? t('home.noPending')
      : pendingCount === 1
      ? t('home.pendingOne')
      : t('home.pending', { n: String(pendingCount) });

  const dayAppointments = appointments.filter((a) => a.date === selected);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[styles.hello, { color: theme.colors.text }]} numberOfLines={2}>
            {t('home.hello')}, {displayName}
          </Text>
          <Text style={[styles.greet, { color: theme.colors.textVar }]}>{greeting}</Text>
          <Text style={[styles.date, { color: theme.colors.textVar }]}>{dateLabel}</Text>
        </View>

        {/* ─── Week strip ─────────────────────────────────────────────── */}
        <View style={styles.weekStrip}>
          {weekDays.map((iso) => {
            const d = new Date(`${iso}T00:00:00`);
            const isSelected = iso === selected;
            const isToday = isTodayIso(iso);
            const hasDoses = (byDay[iso] ?? []).length > 0;
            return (
              <Pressable
                key={iso}
                onPress={() => setSelected(iso)}
                accessibilityRole="button"
                accessibilityLabel={iso}
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : isToday
                      ? theme.colors.primary
                      : theme.colors.outline,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayPillDow,
                    { color: isSelected ? 'rgba(255,255,255,0.9)' : theme.colors.textVar },
                  ]}
                >
                  {weekdayShort(iso)}
                </Text>
                <Text style={[styles.dayPillNum, { color: isSelected ? '#fff' : theme.colors.text }]}>
                  {d.getDate()}
                </Text>
                <View
                  style={[
                    styles.dayPillDot,
                    {
                      backgroundColor: hasDoses
                        ? isSelected
                          ? '#fff'
                          : theme.colors.primary
                        : 'transparent',
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>

        {/* ─── Today shortcut + pendientes chip ───────────────────────── */}
        <View style={styles.pendingRow}>
          {selected !== today ? (
            <Pressable
              onPress={() => setSelected(today)}
              accessibilityRole="button"
              accessibilityLabel={t('home.today')}
              style={[styles.todayBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
              hitSlop={6}
            >
              <Icon name="today" size={14} color={theme.colors.primary} />
              <Text style={[styles.todayText, { color: theme.colors.primary }]}>{t('home.today')}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <View style={[styles.pendingChip, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.pendingText, { color: theme.colors.primary }]}>{pendingLabel}</Text>
          </View>
        </View>

        {/* ─── Dose cards ─────────────────────────────────────────────── */}
        {profilesLoading || agendaLoading ? (
          <Loader fill={false} />
        ) : agenda.length === 0 ? (
          <EmptyState icon="event-available" title={t('home.noDosesDay')} />
        ) : (
          <View style={styles.doseList}>
            {agenda.map((event) => (
              <DoseRow key={event.key} event={event} log={dayLogs[event.key]} />
            ))}
          </View>
        )}

        {/* ─── Citas médicas ──────────────────────────────────────────── */}
        <View style={styles.apptSection}>
          <View style={styles.apptHeader}>
            <Text style={[styles.apptTitle, { color: theme.colors.text }]}>
              {t('home.appointments')}
            </Text>
            <Pressable
              onPress={() => router.push('/appointment-form')}
              accessibilityRole="button"
              accessibilityLabel={t('home.schedule')}
              hitSlop={8}
              style={styles.apptCta}
            >
              <Icon name="add" size={18} color={theme.colors.primary} />
              <Text style={[styles.apptCtaText, { color: theme.colors.primary }]}>
                {t('home.schedule')}
              </Text>
            </Pressable>
          </View>

          {dayAppointments.length === 0 ? (
            <EmptyState icon="event-busy" title={t('home.noApptsDay')} />
          ) : (
            <View style={styles.apptList}>
              {dayAppointments.map((appt) => (
                <AppointmentRow
                  key={appt.id}
                  appointment={appt}
                  onPress={() =>
                    router.push({ pathname: '/appointment-form', params: { id: appt.id } })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ───── Dose row ─────────────────────────────────────────────────────────────

interface DoseRowProps {
  event: DoseEvent;
  log: DayLog | undefined;
}

interface StatusView {
  label: string;
  color: string;
}

function useDoseStatus(event: DoseEvent, log: DayLog | undefined): StatusView {
  const theme = useTheme();
  const { t } = useTranslation();
  if (log) {
    if (log.status === 'administered') return { label: t('home.statusGiven'), color: theme.status.ok };
    if (log.status === 'skipped') return { label: t('home.statusSkipped'), color: theme.status.danger };
    return { label: t('home.statusSnoozed'), color: theme.status.warn };
  }
  return { label: t('home.statusPending'), color: theme.status.warn };
}

function DoseRow({ event, log }: DoseRowProps) {
  const theme = useTheme();
  const status = useDoseStatus(event, log);
  const medIcon: IconName = event.ownerType === 'pet' ? 'pets' : iconForForm(event.medForm);

  return (
    <View style={[styles.doseCard, { backgroundColor: theme.colors.surface }]}>
      {/* Time + status */}
      <View style={styles.doseTimeCol}>
        <Text style={[styles.doseTime, { color: theme.colors.text }]}>{event.time}</Text>
        <Text style={[styles.doseStatus, { color: status.color }]}>{status.label}</Text>
      </View>

      {/* Divider */}
      <View style={[styles.doseDivider, { backgroundColor: theme.colors.outline }]} />

      {/* Avatar */}
      <Avatar initial={event.ownerInitial} color={event.ownerColor} size={38} />

      {/* Med + owner·dose */}
      <View style={styles.doseBody}>
        <Text style={[styles.doseName, { color: theme.colors.text }]} numberOfLines={1}>
          {event.medicationName}
        </Text>
        <Text style={[styles.doseSub, { color: theme.colors.textVar }]} numberOfLines={1}>
          {event.ownerName} · {event.dose}
        </Text>
      </View>

      {/* Med form icon */}
      <View style={styles.doseIconWrap}>
        <Icon name={medIcon} size={22} color={event.ownerColor} />
      </View>
    </View>
  );
}

// ───── Appointment row ──────────────────────────────────────────────────────

interface AppointmentRowProps {
  appointment: ReturnType<typeof useAppointments>['data'] extends readonly (infer U)[] | undefined
    ? U
    : never;
  onPress: () => void;
}

const MONTHS_ES_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function AppointmentRow({ appointment, onPress }: AppointmentRowProps) {
  const theme = useTheme();
  const d = new Date(`${appointment.date}T00:00:00`);
  const dayNum = d.getDate();
  const monthLabel = MONTHS_ES_SHORT[d.getMonth()];
  const weekdayLbl = weekdayShort(appointment.date);
  const timeChip = `${weekdayLbl} ${dayNum} · ${appointment.time}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={appointment.doctor}
      style={[styles.apptCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.apptDateBadge, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.apptDayNum, { color: theme.colors.primary }]}>{dayNum}</Text>
        <Text style={[styles.apptMonth, { color: theme.colors.primary }]}>{monthLabel}</Text>
      </View>

      <View style={styles.apptBody}>
        <Text style={[styles.apptDoctor, { color: theme.colors.text }]} numberOfLines={1}>
          {appointment.doctor}
        </Text>
        <Text style={[styles.apptPerson, { color: theme.colors.textVar }]} numberOfLines={1}>
          {appointment.profileName}
        </Text>
        <View style={[styles.apptTimeChip, { backgroundColor: theme.colors.primaryContainer }]}>
          <Icon name="schedule" size={12} color={theme.colors.primary} />
          <Text style={[styles.apptTimeText, { color: theme.colors.primary }]}>{timeChip}</Text>
        </View>
      </View>

      <Icon name="chevron-right" size={22} color={theme.colors.textVar} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 32 },

  header: { gap: 2 },
  hello: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  greet: { fontSize: 15, marginTop: 2 },
  date: { fontSize: 13, marginTop: 2 },

  weekStrip: { flexDirection: 'row', gap: 6, marginTop: 6 },
  dayPill: {
    flex: 1,
    minHeight: 68,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  dayPillDow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  dayPillNum: { fontSize: 18, fontWeight: '800', lineHeight: 20 },
  dayPillDot: { width: 5, height: 5, borderRadius: 3 },

  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    borderWidth: 1,
  },
  todayText: { fontSize: 12, fontWeight: '700' },
  pendingChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 100 },
  pendingText: { fontSize: 12, fontWeight: '700' },

  doseList: { gap: 10, marginTop: 2 },
  doseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    shadowColor: '#0b1220',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  doseTimeCol: { width: 66, gap: 2 },
  doseTime: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  doseStatus: { fontSize: 11, fontWeight: '700' },
  doseDivider: { width: 1, alignSelf: 'stretch', marginVertical: 4 },
  doseBody: { flex: 1, gap: 2 },
  doseName: { fontSize: 15, fontWeight: '700' },
  doseSub: { fontSize: 13 },
  doseIconWrap: { width: 32, alignItems: 'center', justifyContent: 'center' },

  apptSection: { marginTop: 18, gap: 10 },
  apptHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  apptTitle: { fontSize: 18, fontWeight: '800' },
  apptCta: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 4 },
  apptCtaText: { fontSize: 14, fontWeight: '700' },

  apptList: { gap: 10 },
  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 18,
    shadowColor: '#0b1220',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  apptDateBadge: {
    width: 52,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  apptDayNum: { fontSize: 20, fontWeight: '800', lineHeight: 22 },
  apptMonth: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  apptBody: { flex: 1, gap: 4 },
  apptDoctor: { fontSize: 15, fontWeight: '800' },
  apptPerson: { fontSize: 13 },
  apptTimeChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
    marginTop: 2,
  },
  apptTimeText: { fontSize: 11, fontWeight: '700' },
});
