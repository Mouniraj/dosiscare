import { StyleSheet, Text, View } from 'react-native';

import type { Medication } from '../../database/models';
import { durationLabel, medStatusLabel, scheduleLabel } from '../../i18n/format';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { iconForForm, statusBadge } from '../../utils/medication';
import { ActionRow } from '../ui/ActionChip';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';
import { Icon } from '../ui/Icon';
import { Toggle } from '../ui/Toggle';

interface MedicationCardProps {
  medication: Medication;
  onToggleActive: (isActive: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Treatment card: identity, schedule, status, active toggle and actions. */
export function MedicationCard({ medication, onToggleActive, onEdit, onDelete }: MedicationCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const status = statusBadge(medication.status);

  return (
    <Card>
      <View style={styles.head}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
          <Icon name={iconForForm(medication.form)} size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.identity}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {medication.name}
          </Text>
          <Text style={[styles.dose, { color: theme.colors.textVar }]}>{medication.dose}</Text>
        </View>
        <Toggle value={medication.isActive} onValueChange={onToggleActive} />
      </View>

      <View style={styles.metaRow}>
        <Meta icon="schedule" text={scheduleLabel(t, medication)} />
        <Meta icon="event-repeat" text={durationLabel(t, medication)} />
      </View>

      <Divider spacing={12} />

      <View style={styles.footer}>
        <Badge label={medStatusLabel(t, medication.status)} tone={status.tone} />
        <ActionRow actions={['edit', 'delete']} onAction={(a) => (a === 'delete' ? onDelete() : onEdit())} />
      </View>
    </Card>
  );
}

function Meta({ icon, text }: { icon: 'schedule' | 'event-repeat'; text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={15} color={theme.colors.textVar} />
      <Text style={[styles.metaText, { color: theme.colors.textVar }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  identity: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700' },
  dose: { fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
