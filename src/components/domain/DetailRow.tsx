import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { ActionRow } from '../ui/ActionChip';
import { Card } from '../ui/Card';
import { Icon, type IconName } from '../ui/Icon';

interface DetailRowProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  meta?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Generic card row for detail sub-lists (vaccines, vet visits, symptoms). */
export function DetailRow({ icon, title, subtitle, meta, onEdit, onDelete }: DetailRowProps) {
  const theme = useTheme();
  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
          <Icon name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textVar }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {meta ? <Text style={[styles.meta, { color: theme.colors.textVar }]}>{meta}</Text> : null}
      </View>
      {onEdit || onDelete ? (
        <View style={styles.actions}>
          <ActionRow actions={['edit', 'delete']} onAction={(a) => (a === 'delete' ? onDelete?.() : onEdit?.())} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  meta: { fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});
