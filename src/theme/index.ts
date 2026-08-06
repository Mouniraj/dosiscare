export * from './colors';
export * from './typography';
export * from './spacing';

import { palettes, statusColors, type ThemeColors, type ThemeMode } from './colors';
import { fontFamily, fontSize, fontWeight } from './typography';
import { spacing, radius } from './spacing';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  status: typeof statusColors;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  spacing: typeof spacing;
  radius: typeof radius;
}

export function buildTheme(mode: ThemeMode, accent?: string): Theme {
  const base = palettes[mode];
  // The prototype only overrides the accent in light mode.
  const colors = accent && mode === 'light' ? { ...base, primary: accent } : base;
  return {
    mode,
    colors,
    status: statusColors,
    fontFamily,
    fontSize,
    fontWeight,
    spacing,
    radius,
  };
}
