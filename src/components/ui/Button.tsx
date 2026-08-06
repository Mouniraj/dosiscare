import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}

/** Primary action button with prototype-faithful variants and states. */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.primaryContainer,
    ghost: 'transparent',
    danger: theme.status.danger,
  };
  const fg: Record<ButtonVariant, string> = {
    primary: '#ffffff',
    secondary: theme.colors.primary,
    ghost: theme.colors.primary,
    danger: '#ffffff',
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        {
          backgroundColor: bg[variant],
          borderColor: variant === 'ghost' ? theme.colors.outline : 'transparent',
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderRadius: theme.radius.md,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={size === 'sm' ? 17 : 19} color={fg[variant]} /> : null}
          <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: fg[variant] }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  md: { paddingVertical: 14, paddingHorizontal: 20, minHeight: 50 },
  sm: { paddingVertical: 9, paddingHorizontal: 14, minHeight: 38 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15, fontWeight: '700' },
  labelSm: { fontSize: 13 },
});
