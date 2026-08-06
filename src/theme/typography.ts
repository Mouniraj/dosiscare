/**
 * Typography scale. The prototype uses `Roboto Flex` (primary) with `Roboto` fallback,
 * and `Material Symbols Rounded` for icons. Font weights observed: 400/500/700/800.
 */

export const fontFamily = {
  regular: 'RobotoFlex_400Regular',
  medium: 'RobotoFlex_500Medium',
  bold: 'RobotoFlex_700Bold',
  /** System fallback used until custom fonts finish loading. */
  system: undefined as string | undefined,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 19,
  '2xl': 22,
  '3xl': 26,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  bold: '700',
  heavy: '800',
} as const;

export type FontSizeToken = keyof typeof fontSize;
