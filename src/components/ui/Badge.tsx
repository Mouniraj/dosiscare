import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Icon, type IconName } from './Icon';

export type BadgeTone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
}

/** Pill status badge (administrada / pendiente / programada, etc.). */
export function Badge({ label, tone = 'neutral', icon }: BadgeProps) {
  const theme = useTheme();

  const tones: Record<BadgeTone, { bg: string; fg: string }> = {
    ok: { bg: theme.colors.greenContainer, fg: theme.status.onOk },
    warn: { bg: '#fff3e6', fg: theme.status.warn },
    danger: { bg: '#ffe6e6', fg: theme.status.dangerStrong },
    info: { bg: theme.colors.primaryContainer, fg: theme.colors.primary },
    neutral: { bg: theme.colors.bg, fg: theme.colors.textVar },
  };
  const c = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      {icon ? <Icon name={icon} size={13} color={c.fg} /> : null}
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
