import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppointmentCard,
  Avatar,
  ConfirmDialog,
  EmptyState,
  Icon,
  Loader,
} from '../../src/components';
import type { IconName } from '../../src/components/ui/Icon';
import type { DoseStatus } from '../../src/database/models';
import type { DoseEvent } from '../../src/services/AgendaService';
import type { DayLog } from '../../src/services/DoseHistoryService';
import { doseStatusLabel } from '../../src/i18n/format';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useToast } from '../../src/contexts/ToastContext';
import { useDayAgenda, useRangeAgenda } from '../../src/hooks/useAgenda';
import { useAppointments, useDeleteAppointment } from '../../src/hooks/useAppointments';
import { useDayLogs, useLogDose, useUndoDose } from '../../src/hooks/useDoseHistory';
import { useSessionStore } from '../../src/store/sessionStore';
import {
  addDaysIso,
  daysInMonth,
  dowMondayFirst,
  firstOfMonth,
  formatDateLong,
  formatMonthYear,
  isTodayIso,
  isWithinRange,
  mondayOfWeek,
  weekdayShort,
} from '../../src/utils/date';
import { todayIso } from '../../src/utils/format';
import { DOSE_STATUS_META, DOSE_STATUSES } from '../../src/utils/medication';
import { useTheme } from '../../src/theme/useTheme';

type CareView = 'day' | 'week' | 'month';

const RANGE_DAYS: Record<CareView, number> = { day: 1, week: 7, month: 30 };
const DOW_INITIALS_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Cuidados: today's agenda + week grid + month calendar (prototype-aligned). */
export default function CareScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useSessionStore((s) => s.user);
  const today = todayIso();

  const tabs: { value: CareView; label: string }[] = [
    { value: 'day', label: t('care.day') },
    { value: 'week', label: t('care.week') },
    { value: 'month', label: t('care.month') },
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('care.title')}</Text>
          <Pressable
            onPress={() => router.push('/appointment-form')}
            accessibilityRole="button"
            accessibilityLabel={t('care.scheduleAppt')}
            style={[styles.addBtn, { backgroundColor: theme.colors.primaryContainer }]}
            hitSlop={6}
          >
            <Icon name="add" size={22} color={theme.colors.primary} />
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {tabs.map((tb) => {
            const active = view === tb.value;
            return (
              <Pressable
                key={tb.value}
                onPress={() => setView(tb.value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={tb.label}
                style={[
                  styles.tab,
                  { backgroundColor: active ? theme.colors.primary : theme.colors.surface },
                ]}
              >
                <Text style={[styles.tabLabel, { color: active ? '#fff' : theme.colors.textVar }]}>
                  {tb.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {view === 'day' && (
          <DayView
            today={today}
            agenda={agenda}
            loading={agendaLoading}
            dayLogs={dayLogs}
            onLog={onLogDose}
            onUndo={(id) => undoDose.mutate(id)}
            onGoDetail={(ownerType, ownerId) =>
              router.push(ownerType === 'pet' ? `/pet/${ownerId}` : `/person/${ownerId}`)
            }
          />
        )}

        {view === 'week' && <WeekView userId={user?.id} today={today} />}

        {view === 'month' && <MonthView userId={user?.id} today={today} />}

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

// ───── Day view (grouped by profile / pet) ──────────────────────────────────

interface OwnerGroup {
  ownerId: string;
  ownerType: 'person' | 'pet';
  ownerName: string;
  ownerColor: string;
  ownerInitial: string;
  events: DoseEvent[];
}

function groupByOwner(events: DoseEvent[]): OwnerGroup[] {
  const map = new Map<string, OwnerGroup>();
  for (const ev of events) {
    let g = map.get(ev.ownerId);
    if (!g) {
      g = {
        ownerId: ev.ownerId,
        ownerType: ev.ownerType,
        ownerName: ev.ownerName,
        ownerColor: ev.ownerColor,
        ownerInitial: ev.ownerInitial,
        events: [],
      };
      map.set(ev.ownerId, g);
    }
    g.events.push(ev);
  }
  return Array.from(map.values());
}

interface DoseStatusView {
  key: 'given' | 'snoozed' | 'skipped' | 'due' | 'scheduled';
  label: string;
  color: string;
  icon: IconName;
}

function deriveStatus(
  event: DoseEvent,
  log: DayLog | undefined,
  theme: ReturnType<typeof useTheme>,
  isFirstPending: boolean,
  t: ReturnType<typeof useTranslation>['t'],
): DoseStatusView {
  if (log) {
    const meta = DOSE_STATUS_META[log.status];
    const color =
      meta.tone === 'ok' ? theme.status.ok : meta.tone === 'danger' ? theme.status.danger : theme.status.warn;
    return { key: log.status as DoseStatusView['key'], label: doseStatusLabel(t, log.status), color, icon: meta.icon };
  }
  const now = Date.now();
  if (event.scheduledAt < now || isFirstPending) {
    return { key: 'due', label: t('care.statusPending'), color: theme.status.warn, icon: 'schedule' };
  }
  return { key: 'scheduled', label: t('care.statusScheduled'), color: theme.colors.textVar, icon: 'radio-button-unchecked' };
}

function DayView({
  today,
  agenda,
  loading,
  dayLogs,
  onLog,
  onUndo,
  onGoDetail,
}: {
  today: string;
  agenda: DoseEvent[];
  loading: boolean;
  dayLogs: Record<string, DayLog>;
  onLog: (event: DoseEvent, status: DoseStatus) => void;
  onUndo: (id: string) => void;
  onGoDetail: (ownerType: 'person' | 'pet', ownerId: string) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const groups = useMemo(() => groupByOwner(agenda), [agenda]);

  if (loading) return <Loader fill={false} />;
  if (agenda.length === 0) {
    return (
      <View style={styles.section}>
        <EmptyState icon="event-available" title={t('care.noDosesTitle')} message={t('care.noDosesMsg')} />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10, gap: 22 }}>
      {groups.map((g) => (
        <View key={g.ownerId}>
          <View style={styles.groupHeader}>
            <Avatar initial={g.ownerInitial} color={g.ownerColor} size={30} />
            <Text style={[styles.groupName, { color: theme.colors.text }]}>{g.ownerName}</Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.groupDate, { color: theme.colors.textVar }]}>{formatDateLong(today)}</Text>
          </View>

          <View style={{ marginTop: 4 }}>
            {(() => {
              // The "first unlogged" row (past OR future) is the one that
              // needs the user's attention right now — it gets the pending
              // marker + quick actions. Everything else is scannable.
              const firstPendingIdx = g.events.findIndex((e) => !dayLogs[e.key]);
              return g.events.map((event, i) => (
                <TimelineDose
                  key={event.key}
                  event={event}
                  last={i === g.events.length - 1}
                  log={dayLogs[event.key]}
                  isFirstPending={i === firstPendingIdx}
                  onLog={(status) => onLog(event, status)}
                  onUndo={onUndo}
                />
              ));
            })()}
          </View>

          <Pressable
            onPress={() => onGoDetail(g.ownerType, g.ownerId)}
            accessibilityRole="button"
            accessibilityLabel={t('care.goDetail')}
            style={[styles.goDetailBtn, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <Icon name="arrow-forward" size={20} color={theme.colors.primary} />
            <Text style={[styles.goDetailText, { color: theme.colors.primary }]}>{t('care.goDetail')}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function TimelineDose({
  event,
  last,
  log,
  isFirstPending,
  onLog,
  onUndo,
}: {
  event: DoseEvent;
  last: boolean;
  log?: DayLog;
  isFirstPending: boolean;
  onLog: (status: DoseStatus) => void;
  onUndo: (id: string) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const status = deriveStatus(event, log, theme, isFirstPending, t);
  const isPastDue = !log && event.scheduledAt < Date.now();
  // Only the single "first unlogged" row shows quick actions inline — the rest
  // of the day stays scannable. To log any other row the user opens the detail.
  const showActions = !log && isFirstPending;
  const timeColor = log || isPastDue ? theme.colors.textVar : theme.colors.text;

  return (
    <View style={styles.tRow}>
      <View style={styles.tTimeCol}>
        <Text style={[styles.tTime, { color: timeColor }]}>{event.time}</Text>
      </View>

      <View style={styles.tRailCol}>
        <View style={[styles.tMarker, { borderColor: status.color, backgroundColor: log && status.key === 'given' ? status.color : theme.colors.bg }]}>
          <Icon
            name={status.icon}
            size={12}
            color={log && status.key === 'given' ? '#fff' : status.color}
          />
        </View>
        {!last && <View style={[styles.tLine, { backgroundColor: theme.colors.outline }]} />}
      </View>

      <View style={styles.tCardWrap}>
        <View style={[styles.tCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={styles.tCardHead}>
            <View style={[styles.tIcon, { backgroundColor: theme.colors.greenContainer }]}>
              <Icon
                name={event.ownerType === 'pet' ? 'pets' : 'medication'}
                size={20}
                color={theme.status.ok}
              />
            </View>
            <View style={styles.tCardBody}>
              <Text style={[styles.tMedName, { color: theme.colors.text }]}>{event.medicationName}</Text>
              <Text style={[styles.tOwner, { color: theme.colors.textVar }]}>{event.dose}</Text>
            </View>
            <View style={styles.tStatusCol}>
              <Text style={[styles.tStatusText, { color: status.color }]}>{status.label}</Text>
              {log && (
                <Pressable onPress={() => onUndo(log.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('care.undo')}>
                  <Text style={[styles.tUndoInline, { color: theme.colors.primary }]}>{t('care.undo')}</Text>
                </Pressable>
              )}
            </View>
          </View>

          {showActions && (
            <View style={styles.tActions}>
              {DOSE_STATUSES.map((s, idx) => {
                const meta = DOSE_STATUS_META[s];
                const label = doseStatusLabel(t, s);
                const color =
                  meta.tone === 'ok' ? theme.status.ok : meta.tone === 'danger' ? theme.status.danger : theme.status.warn;
                const primary = idx === 0;
                const bg = primary ? color : color + '1f';
                const fg = primary ? '#fff' : color;
                return (
                  <Pressable
                    key={s}
                    onPress={() => onLog(s)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    style={[styles.tActionBtn, { backgroundColor: bg, flex: primary ? 1.4 : 1 }]}
                  >
                    <Icon name={meta.icon} size={18} color={fg} />
                    <Text style={[styles.tActionText, { color: fg }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ───── Week view ────────────────────────────────────────────────────────────

function WeekView({ userId, today }: { userId: string | undefined; today: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const monday = useMemo(() => mondayOfWeek(today), [today]);
  const { data: byDay = {}, isLoading } = useRangeAgenda(userId, monday, 7);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysIso(monday, i)),
    [monday],
  );

  const weekLabel = `${formatDateLong(monday).split(',')[0] ?? monday} – ${formatMonthYear(days[6])}`;

  if (isLoading) return <Loader fill={false} />;

  return (
    <View style={styles.section}>
      <View style={styles.dayHeader}>
        <Text style={[styles.dayHeaderTitle, { color: theme.colors.text }]}>{t('care.week')}</Text>
        <Text style={[styles.dayHeaderDate, { color: theme.colors.textVar }]}>{weekLabel}</Text>
      </View>

      <View style={styles.weekList}>
        {days.map((iso) => {
          const doses = byDay[iso] ?? [];
          const isToday = isTodayIso(iso);
          const d = new Date(`${iso}T00:00:00`);
          return (
            <View
              key={iso}
              style={[styles.weekCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
            >
              <View style={styles.weekCardHead}>
                <View
                  style={[
                    styles.weekDayCell,
                    { backgroundColor: isToday ? theme.colors.primary : theme.colors.bg },
                  ]}
                >
                  <Text style={[styles.weekDayNum, { color: isToday ? '#fff' : theme.colors.text }]}>
                    {d.getDate()}
                  </Text>
                  <Text
                    style={[
                      styles.weekDayDow,
                      { color: isToday ? 'rgba(255,255,255,0.85)' : theme.colors.textVar },
                    ]}
                  >
                    {weekdayShort(iso)}
                  </Text>
                </View>
                <Text style={[styles.weekCount, { color: theme.colors.text }]}>
                  {doses.length === 0 ? t('care.noDoses') : t('care.doseCount', { n: String(doses.length) })}
                </Text>
              </View>

              {doses.length > 0 && (
                <View style={[styles.weekChips, { borderTopColor: theme.colors.outline }]}>
                  {doses.map((ev) => (
                    <View
                      key={ev.key}
                      style={[
                        styles.chip,
                        { backgroundColor: theme.colors.primaryContainer },
                      ]}
                    >
                      <Icon name="schedule" size={13} color={theme.colors.primary} />
                      <Text style={[styles.chipText, { color: theme.colors.primary }]}>
                        {ev.time} · {ev.medicationName}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ───── Month view ───────────────────────────────────────────────────────────

function MonthView({ userId, today }: { userId: string | undefined; today: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const first = useMemo(() => firstOfMonth(today), [today]);
  const monthDays = useMemo(() => daysInMonth(first), [first]);
  const leadingBlanks = useMemo(() => dowMondayFirst(first), [first]);
  const totalCells = leadingBlanks + monthDays;
  const trailingBlanks = (7 - (totalCells % 7)) % 7;

  const { data: byDay = {}, isLoading } = useRangeAgenda(userId, first, monthDays);
  const { data: allAppointments = [] } = useAppointments(userId);

  const [selected, setSelected] = useState<string>(today);

  const cells = useMemo(() => {
    const arr: (string | null)[] = [];
    for (let i = 0; i < leadingBlanks; i += 1) arr.push(null);
    for (let d = 1; d <= monthDays; d += 1) {
      arr.push(addDaysIso(first, d - 1));
    }
    for (let i = 0; i < trailingBlanks; i += 1) arr.push(null);
    return arr;
  }, [first, leadingBlanks, monthDays, trailingBlanks]);

  const totalDoses = useMemo(
    () => Object.values(byDay).reduce((sum, list) => sum + list.length, 0),
    [byDay],
  );

  const selectedDoses = byDay[selected] ?? [];
  const selectedAppts = allAppointments.filter((a) => a.date === selected);
  const selectedEmpty = selectedDoses.length === 0 && selectedAppts.length === 0;

  if (isLoading) return <Loader fill={false} />;

  return (
    <View style={styles.section}>
      <View style={styles.dayHeader}>
        <Text style={[styles.dayHeaderTitle, { color: theme.colors.text, textTransform: 'capitalize' }]}>
          {formatMonthYear(first)}
        </Text>
        <Text style={[styles.dayHeaderDate, { color: theme.colors.textVar }]}>
          {t('care.doseCount', { n: String(totalDoses) })}
        </Text>
      </View>

      <View style={styles.dowRow}>
        {DOW_INITIALS_ES.map((l, i) => (
          <Text key={i} style={[styles.dowCell, { color: theme.colors.textVar }]}>
            {l}
          </Text>
        ))}
      </View>

      <View style={styles.monthGrid}>
        {cells.map((iso, i) => {
          if (!iso) {
            return <View key={`b-${i}`} style={styles.monthCell} />;
          }
          const has = (byDay[iso] ?? []).length > 0;
          const isSelected = iso === selected;
          const isToday = isTodayIso(iso);
          const dayNum = new Date(`${iso}T00:00:00`).getDate();
          return (
            <Pressable
              key={iso}
              onPress={() => setSelected(iso)}
              accessibilityRole="button"
              accessibilityLabel={iso}
              style={[
                styles.monthCell,
                styles.monthCellBtn,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : isToday
                    ? theme.colors.primaryContainer
                    : theme.colors.surface,
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
                  styles.monthDayNum,
                  {
                    color: isSelected
                      ? '#fff'
                      : isToday
                      ? theme.colors.primary
                      : theme.colors.text,
                  },
                ]}
              >
                {dayNum}
              </Text>
              <View
                style={[
                  styles.monthDot,
                  {
                    backgroundColor: has
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

      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
        <Text style={[styles.legendText, { color: theme.colors.textVar }]}>{t('care.hasDoseLegend')}</Text>
      </View>

      <View style={[styles.detailBlock, { borderTopColor: theme.colors.outline }]}>
        <Text style={[styles.detailTitle, { color: theme.colors.text }]}>{formatDateLong(selected)}</Text>

        {selectedEmpty ? (
          <View style={styles.detailEmpty}>
            <Icon name="event-available" size={32} color={theme.colors.textVar} />
            <Text style={[styles.detailEmptyText, { color: theme.colors.textVar }]}>
              {t('care.detailEmpty')}
            </Text>
          </View>
        ) : (
          <>
            {selectedDoses.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textVar }]}>
                  {t('care.medications')}
                </Text>
                {selectedDoses.map((ev) => (
                  <View
                    key={ev.key}
                    style={[styles.detailCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                  >
                    <View style={[styles.detailIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                      <Icon name="medication" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.detailBody}>
                      <Text style={[styles.detailName, { color: theme.colors.text }]}>{ev.medicationName}</Text>
                      <View style={styles.tOwnerRow}>
                        <Avatar initial={ev.ownerInitial} color={ev.ownerColor} size={18} />
                        <Text style={[styles.tOwner, { color: theme.colors.textVar }]}>
                          {ev.ownerName} · {ev.dose}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}>
                      <Icon name="schedule" size={13} color={theme.colors.primary} />
                      <Text style={[styles.chipText, { color: theme.colors.primary }]}>{ev.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {selectedAppts.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textVar }]}>
                  {t('care.appointments')}
                </Text>
                {selectedAppts.map((ap) => (
                  <View
                    key={ap.id}
                    style={[styles.detailCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                  >
                    <View style={[styles.detailIcon, { backgroundColor: theme.colors.greenContainer }]}>
                      <Icon name="event" size={20} color={theme.status.onOk} />
                    </View>
                    <View style={styles.detailBody}>
                      <Text style={[styles.detailName, { color: theme.colors.text }]}>{ap.doctor}</Text>
                      <View style={styles.tOwnerRow}>
                        <Avatar initial={ap.profileInitial} color={ap.profileColor} size={18} />
                        <Text style={[styles.tOwner, { color: theme.colors.textVar }]}>{ap.profileName}</Text>
                      </View>
                    </View>
                    <View style={[styles.chip, { backgroundColor: theme.colors.greenContainer }]}>
                      <Icon name="schedule" size={13} color={theme.status.onOk} />
                      <Text style={[styles.chipText, { color: theme.status.onOk }]}>{ap.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  addBtn: { minWidth: 44, minHeight: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  tabs: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 6 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 13, fontWeight: '700' },

  section: { marginTop: 14, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },

  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayHeaderTitle: { fontSize: 16, fontWeight: '700' },
  dayHeaderDate: { fontSize: 13, textTransform: 'capitalize' },

  // ─── Group header (profile / pet) ────────────────────────────────────────
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  groupName: { fontSize: 17, fontWeight: '800' },
  groupDate: { fontSize: 13 },
  goDetailBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    minHeight: 44,
    borderRadius: 16,
  },
  goDetailText: { fontSize: 14, fontWeight: '700' },

  // ─── Timeline ────────────────────────────────────────────────────────────
  tRow: { flexDirection: 'row', gap: 12, minHeight: 76 },
  tTimeCol: { width: 52, alignItems: 'flex-end', paddingTop: 20 },
  tTime: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  tRailCol: { width: 26, alignItems: 'center' },
  // 26x26 status ring per prototype — icon inside conveys state without color-only.
  tMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginTop: 15,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tLine: { flex: 1, width: 2, marginTop: 2 },
  tCardWrap: { flex: 1, paddingBottom: 12 },
  tCard: { borderWidth: 1, borderRadius: 18, padding: 12, gap: 10 },
  tCardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tCardBody: { flex: 1, gap: 2 },
  tMedName: { fontSize: 15, fontWeight: '700' },
  tOwnerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tOwner: { fontSize: 13 },
  tStatusCol: { alignItems: 'flex-end', gap: 4 },
  tStatusText: { fontSize: 12, fontWeight: '700' },
  tUndoInline: { fontSize: 12, fontWeight: '700' },
  tActions: { flexDirection: 'row', gap: 8 },
  tActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    minHeight: 44,
    borderRadius: 100,
  },
  tActionText: { fontSize: 13, fontWeight: '700' },

  // ─── Week ────────────────────────────────────────────────────────────────
  weekList: { gap: 10, marginTop: 4 },
  weekCard: { borderWidth: 1, borderRadius: 18, padding: 14 },
  weekCardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weekDayCell: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayNum: { fontSize: 16, fontWeight: '800', lineHeight: 18 },
  weekDayDow: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  weekCount: { fontSize: 14, fontWeight: '700', flex: 1 },
  weekChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  chipText: { fontSize: 11, fontWeight: '700' },

  // ─── Month ───────────────────────────────────────────────────────────────
  dowRow: { flexDirection: 'row', marginTop: 6, marginBottom: 4 },
  dowCell: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  monthCellBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    gap: 3,
  },
  monthDayNum: { fontSize: 14, fontWeight: '700' },
  monthDot: { width: 5, height: 5, borderRadius: 3 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: 12, fontWeight: '600' },
  detailBlock: { marginTop: 18, paddingTop: 16, borderTopWidth: 1, gap: 4 },
  detailTitle: { fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
  detailSection: { marginTop: 14, gap: 8 },
  detailLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  detailIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  detailBody: { flex: 1, gap: 4 },
  detailName: { fontSize: 14, fontWeight: '700' },
  detailEmpty: { alignItems: 'center', gap: 8, paddingVertical: 26, paddingHorizontal: 16 },
  detailEmptyText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  list: { gap: 14, marginTop: 6 },
});
