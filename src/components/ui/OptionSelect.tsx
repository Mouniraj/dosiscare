import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Chip } from './Chip';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface OptionSelectProps<T extends string> {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Single-choice selector rendered as a wrapping row of chips (form fields). */
export function OptionSelect<T extends string>({ label, options, value, onChange }: OptionSelectProps<T>) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: theme.colors.textVar }]}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((opt) => (
          <Chip key={opt.value} label={opt.label} selected={opt.value === value} onPress={() => onChange(opt.value)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', marginLeft: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
