import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { useTheme } from '../../theme/useTheme';

type TextVariant = 'title' | 'heading' | 'body' | 'label' | 'caption' | 'overline';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Use the muted (secondary) text color. */
  muted?: boolean;
  color?: string;
}

/**
 * Typographic text component. Centralizes font sizes/weights so screens never
 * hardcode typography — matching the prototype's scale.
 */
export function Text({ variant = 'body', muted, color, style, ...rest }: TextProps) {
  const theme = useTheme();
  const resolved = color ?? (muted ? theme.colors.textVar : theme.colors.text);
  return <RNText style={[styles[variant], { color: resolved }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800' },
  heading: { fontSize: 17, fontWeight: '800' },
  body: { fontSize: 14, fontWeight: '400' },
  label: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '400' },
  overline: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});
