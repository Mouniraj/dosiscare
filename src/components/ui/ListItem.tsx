import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Icon, type IconName } from './Icon';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leadingIcon?: IconName;
  /** Custom leading node (e.g. an Avatar), takes precedence over leadingIcon. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
}

/** Generic tappable list row used across menus and lists. */
export function ListItem({
  title,
  subtitle,
  leadingIcon,
  leading,
  trailing,
  showChevron,
  onPress,
}: ListItemProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderRadius: theme.radius.lg,
          opacity: pressed && onPress ? 0.8 : 1,
        },
      ]}
    >
      {leading ?? (leadingIcon ? <Icon name={leadingIcon} size={22} color={theme.colors.primary} /> : null)}
      <View style={styles.texts}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textVar }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {showChevron ? <Icon name="chevron-right" size={22} color={theme.colors.textVar} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  texts: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12, marginTop: 2 },
});
