import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Badge, Card, Chip, EmptyState, Header, Loader } from '../src/components';
import type { DoseStatus } from '../src/database/models';
import { useDoseHistory } from '../src/hooks/useDoseHistory';
import { doseStatusLabel } from '../src/i18n/format';
import { useTranslation } from '../src/i18n/useTranslation';
import { useSessionStore } from '../src/store/sessionStore';
import { formatDateShort } from '../src/utils/date';
import { DOSE_STATUS_META } from '../src/utils/medication';
import { useTheme } from '../src/theme/useTheme';

type StatusFilter = 'all' | DoseStatus;

/** Historial: past dose logs with status + person filters. */
export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useSessionStore((s) => s.user);
  const { data: history = [], isLoading } = useDoseHistory(user?.id);

  const [status, setStatus] = useState<StatusFilter>('all');
  const [ownerId, setOwnerId] = useState<string>('all');

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('history.all') },
    { value: 'administered', label: t('history.administered') },
    { value: 'postponed', label: t('history.postponed') },
    { value: 'skipped', label: t('history.skipped') },
  ];

  const owners = useMemo(() => {
    const seen = new Map<string, string>();
    history.forEach((h) => seen.set(h.profileId, h.ownerName));
    return [{ id: 'all', name: t('history.all') }, ...Array.from(seen, ([id, name]) => ({ id, name }))];
  }, [history, t]);

  const filtered = history.filter(
    (h) => (status === 'all' || h.status === status) && (ownerId === 'all' || h.profileId === ownerId),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header title={t('history.title')} onBack={() => router.back()} />

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {statusFilters.map((f) => (
            <Chip key={f.value} label={f.label} selected={status === f.value} onPress={() => setStatus(f.value)} />
          ))}
        </ScrollView>
        {owners.length > 2 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {owners.map((o) => (
              <Chip key={o.id} label={o.name} selected={ownerId === o.id} onPress={() => setOwnerId(o.id)} />
            ))}
          </ScrollView>
        ) : null}
      </View>

      {isLoading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState icon="history" title={t('history.emptyTitle')} message={t('history.emptyMsg')} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.list}>
            {filtered.map((entry) => {
              const meta = DOSE_STATUS_META[entry.status];
              return (
                <Card key={entry.id}>
                  <View style={styles.row}>
                    <Avatar initial={entry.ownerInitial} color={entry.ownerColor} size={40} />
                    <View style={styles.body}>
                      <Text style={[styles.med, { color: theme.colors.text }]} numberOfLines={1}>
                        {entry.medicationName}
                      </Text>
                      <Text style={[styles.meta, { color: theme.colors.textVar }]}>
                        {entry.ownerName} · {formatDateShort(new Date(entry.scheduledAt).toISOString().slice(0, 10))}
                        {' · '}
                        {new Date(entry.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </Text>
                    </View>
                    <Badge label={doseStatusLabel(t, entry.status)} tone={meta.tone} icon={meta.icon} />
                  </View>
                </Card>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
  filterRow: { gap: 8, paddingRight: 20 },
  content: { padding: 20, paddingTop: 4 },
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  body: { flex: 1 },
  med: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
});
