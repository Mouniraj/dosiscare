/**
 * Design tokens extracted verbatim from the DosisCare prototype (`DosisCare.dc.html`).
 * Do not alter these values — they define the app's visual identity 1:1 with the design.
 */

export interface ThemeColors {
  /** App backdrop behind the device frame / scroll bounce area. */
  canvas: string;
  /** Default screen background. */
  bg: string;
  /** Card / sheet / elevated surface. */
  surface: string;
  /** Bottom navigation background. */
  navBg: string;
  /** Primary text. */
  text: string;
  /** Secondary / muted text. */
  textVar: string;
  /** Hairline borders and dividers. */
  outline: string;
  /** Brand / interactive accent. */
  primary: string;
  /** Tonal container behind primary elements. */
  primaryContainer: string;
  /** Tonal container for positive/green elements. */
  greenContainer: string;
}

export const lightColors: ThemeColors = {
  canvas: '#c9d3e0',
  bg: '#eef2f8',
  surface: '#ffffff',
  navBg: '#ffffff',
  text: '#182031',
  textVar: '#5a6577',
  outline: '#e4e9f1',
  primary: '#2f6bed',
  primaryContainer: '#dde8ff',
  greenContainer: '#d7f2e6',
};

export const darkColors: ThemeColors = {
  canvas: '#070a10',
  bg: '#0f141d',
  surface: '#182130',
  navBg: '#141c28',
  text: '#e8edf5',
  textVar: '#9aa6b8',
  outline: '#2f394a',
  primary: '#8fb3ff',
  primaryContainer: '#1e2c48',
  greenContainer: '#123829',
};

/**
 * Semantic status colors — consistent across both themes (as used by the prototype's
 * action-chip standard and status badges).
 */
export const statusColors = {
  ok: '#17a673',
  onOk: '#0a6b48',
  danger: '#e5484d',
  dangerStrong: '#c62828',
  warn: '#c56a00',
  warnStrong: '#f5931f',
  purple: '#7c5cff',
} as const;

/** Preset profile accent colors offered when creating a person/pet. */
export const profileColors = [
  '#2f6bed', // blue
  '#17a673', // green
  '#f5931f', // orange
  '#7c5cff', // purple
  '#e5484d', // red
  '#c56a00', // amber
] as const;

export type ThemeMode = 'light' | 'dark';

export const palettes: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};
