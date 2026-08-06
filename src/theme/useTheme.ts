import { useMemo } from 'react';

import { useSettingsStore } from '../store/settingsStore';
import { buildTheme, type Theme } from './index';

/**
 * Returns the active theme derived from persisted settings (mode + accent).
 * Components consume tokens through this hook rather than importing palettes.
 */
export function useTheme(): Theme {
  const mode = useSettingsStore((s) => s.theme);
  const accent = useSettingsStore((s) => s.accent);
  return useMemo(() => buildTheme(mode, accent ?? undefined), [mode, accent]);
}
