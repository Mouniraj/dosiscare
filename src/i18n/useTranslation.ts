import { useMemo } from 'react';

import type { Language } from '../constants/config';
import { useSettingsStore } from '../store/settingsStore';
import { makeTranslator, type TFn } from './index';

/** Reactive translation hook: re-renders when the persisted language changes. */
export function useTranslation(): { t: TFn; language: Language } {
  const language = useSettingsStore((s) => s.language);
  const t = useMemo(() => makeTranslator(language), [language]);
  return { t, language };
}
