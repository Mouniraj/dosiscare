import { StyleSheet, Text, View } from 'react-native';

import type { Profile } from '../../database/models';
import { useMedications } from '../../hooks/useMedications';
import { ageLabel } from '../../i18n/format';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { computeNextDose } from '../../utils/medication';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Pressable } from 'react-native';

interface ProfileCardProps {
  profile: Profile;
  onPress: () => void;
}

/** Persona summary card for the Home dashboard: identity + treatment glance. */
export function ProfileCard({ profile, onPress }: ProfileCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: meds = [] } = useMedications('person', profile.id);

  const active = meds.filter((m) => m.isActive);
  const nextDose = active.length
    ? new Date(Math.min(...active.map((m) => computeNextDose(m).getTime()))).toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : null;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card>
        <View style={styles.head}>
          <Avatar initial={profile.initial} color={profile.color} size={48} photoUri={profile.photo} />
          <View style={styles.identity}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                {profile.name}
              </Text>
              {profile.isOwner ? <Badge label={t('menu.titular')} tone="info" /> : null}
            </View>
            <Text style={[styles.meta, { color: theme.colors.textVar }]}>{ageLabel(t, profile.ageNum)}</Text>
          </View>
          <Icon name="chevron-right" size={22} color={theme.colors.textVar} />
        </View>

        <View style={styles.stats}>
          <Stat icon="medication" label={t('stat.active')} value={String(active.length)} />
          <Stat icon="schedule" label={t('stat.next')} value={nextDose ?? '—'} />
          <Stat icon="warning-amber" label={t('stat.allergies')} value={profile.allergy ?? '—'} />
        </View>
      </Card>
    </Pressable>
  );
}

function Stat({ icon, label, value }: { icon: 'medication' | 'schedule' | 'warning-amber'; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={16} color={theme.colors.textVar} />
      <View>
        <Text style={[styles.statValue, { color: theme.colors.text }]} numberOfLines={1}>
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textVar }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  identity: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  meta: { fontSize: 13 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  statValue: { fontSize: 13, fontWeight: '700' },
  statLabel: { fontSize: 11 },
});
