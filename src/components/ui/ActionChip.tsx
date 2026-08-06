import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Icon, type IconName } from './Icon';

export type ActionType = 'view' | 'edit' | 'duplicate' | 'delete';

interface ActionChipProps {
  action: ActionType;
  onPress: () => void;
}

const ICONS: Record<ActionType, IconName> = {
  view: 'visibility',
  edit: 'edit',
  duplicate: 'content-copy',
  delete: 'delete-outline',
};

/**
 * Unified 36×36 action chip from the prototype's standard:
 * view = blue, edit/duplicate = gray, delete = red.
 */
export function ActionChip({ action, onPress }: ActionChipProps) {
  const theme = useTheme();

  const color =
    action === 'view'
      ? theme.colors.primary
      : action === 'delete'
        ? theme.status.danger
        : theme.colors.textVar;

  const bg =
    action === 'view'
      ? theme.colors.primaryContainer
      : action === 'delete'
        ? '#ffe6e6'
        : theme.colors.bg;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={action}
      style={({ pressed }) => [styles.chip, { backgroundColor: bg, opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon name={ICONS[action]} size={19} color={color} />
    </Pressable>
  );
}

interface ActionRowProps {
  actions: ActionType[];
  onAction: (action: ActionType) => void;
}

/** Convenience row rendering a consistent set of action chips. */
export function ActionRow({ actions, onAction }: ActionRowProps) {
  return (
    <View style={styles.row}>
      {actions.map((a) => (
        <ActionChip key={a} action={a} onPress={() => onAction(a)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 8 },
});
