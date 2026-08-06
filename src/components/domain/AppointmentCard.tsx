import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../i18n/useTranslation';
import type { AppointmentWithProfile } from '../../services/AppointmentService';
import { useTheme } from '../../theme/useTheme';
import { formatDateLong } from '../../utils/date';
import { ActionRow } from '../ui/ActionChip';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';
import { Icon } from '../ui/Icon';

interface AppointmentCardProps {
  appointment: AppointmentWithProfile;
  onEdit: () => void;
  onDelete: () => void;
}

/** Medical appointment card: date, doctor, persona and reminders. */
export function AppointmentCard({ appointment, onEdit, onDelete }: AppointmentCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const reminders = [
    appointment.remindDay && t('appt.remDay'),
    appointment.remindHour && t('appt.remHour'),
    appointment.remindAt && t('appt.remAt'),
  ].filter(Boolean) as string[];

  return (
    <Card>
      <View style={styles.head}>
        <View style={[styles.dateChip, { backgroundColor: theme.colors.primaryContainer }]}>
          <Icon name="event" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.identity}>
          <Text style={[styles.doctor, { color: theme.colors.text }]} numberOfLines={1}>
            {appointment.doctor}
          </Text>
          <Text style={[styles.when, { color: theme.colors.textVar }]}>
            {formatDateLong(appointment.date)} · {appointment.time}
          </Text>
        </View>
      </View>

      <View style={styles.personRow}>
        <Avatar initial={appointment.profileInitial} color={appointment.profileColor} size={26} />
        <Text style={[styles.person, { color: theme.colors.textVar }]}>{appointment.profileName}</Text>
      </View>

      {appointment.notes ? (
        <Text style={[styles.notes, { color: theme.colors.textVar }]}>{appointment.notes}</Text>
      ) : null}

      {reminders.length > 0 ? (
        <View style={styles.reminders}>
          <Icon name="notifications-active" size={14} color={theme.colors.textVar} />
          <Text style={[styles.reminderText, { color: theme.colors.textVar }]}>{reminders.join(' · ')}</Text>
        </View>
      ) : null}

      <Divider spacing={12} />
      <View style={styles.footer}>
        <ActionRow actions={['edit', 'delete']} onAction={(a) => (a === 'delete' ? onDelete() : onEdit())} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateChip: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  identity: { flex: 1 },
  doctor: { fontSize: 15, fontWeight: '700' },
  when: { fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  person: { fontSize: 13, fontWeight: '600' },
  notes: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  reminders: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  reminderText: { fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
});
