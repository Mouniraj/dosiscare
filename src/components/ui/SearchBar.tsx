import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Icon } from './Icon';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/** Search input with leading icon and clear affordance. */
export function SearchBar({ value, onChangeText, placeholder = 'Buscar' }: SearchBarProps) {
  const theme = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
      <Icon name="search" size={20} color={theme.colors.textVar} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textVar}
        style={[styles.input, { color: theme.colors.text }]}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} accessibilityLabel="Limpiar búsqueda" hitSlop={8}>
          <Icon name="close" size={18} color={theme.colors.textVar} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 46,
  } as const,
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
});
