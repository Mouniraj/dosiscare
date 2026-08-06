import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Icon, type IconName } from '../ui/Icon';

interface HeaderAction {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: HeaderAction[];
}

/** Screen header with optional back button and trailing actions. */
export function Header({ title, subtitle, onBack, actions }: HeaderProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.outline }]}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Atrás" hitSlop={8}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.titles}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textVar }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        {actions?.map((a) => (
          <Pressable
            key={a.icon}
            onPress={a.onPress}
            accessibilityRole="button"
            accessibilityLabel={a.accessibilityLabel}
            hitSlop={8}
          >
            <Icon name={a.icon} size={22} color={theme.colors.text} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titles: { flex: 1 },
  title: { fontSize: 19, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 16 },
});
