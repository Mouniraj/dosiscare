import { forwardRef } from 'react';
import {
  TextInput,
  type TextInputProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Icon, type IconName } from './Icon';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: IconName;
  /** Trailing static text (e.g. "kg", "cm"). Non-editable. */
  suffix?: string;
}

/**
 * Labeled text input with error state. Designed to plug into React Hook Form
 * via a Controller (value/onChangeText/onBlur are standard TextInput props).
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, icon, suffix, style, ...rest },
  ref,
) {
  const theme = useTheme();
  const borderColor = error ? theme.status.danger : theme.colors.outline;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: theme.colors.textVar }]}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          { backgroundColor: theme.colors.surface, borderColor, borderRadius: theme.radius.md },
        ]}
      >
        {icon ? <Icon name={icon} size={19} color={theme.colors.textVar} /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.textVar}
          style={[styles.input, { color: theme.colors.text }, style]}
          {...rest}
        />
        {suffix ? <Text style={[styles.suffix, { color: theme.colors.textVar }]}>{suffix}</Text> : null}
      </View>
      {error ? <Text style={[styles.error, { color: theme.status.danger }]}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', marginLeft: 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  suffix: { fontSize: 14, fontWeight: '600' },
  error: { fontSize: 12, marginLeft: 2 },
});
