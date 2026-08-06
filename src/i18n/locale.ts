import type { Language } from '../constants/config';
import { useSettingsStore } from '../store/settingsStore';

const BCP47: Record<Language, string> = {
  es: 'es',
  en: 'en-US',
  pt: 'pt-BR',
};

/**
 * Current BCP-47 locale derived from the persisted language. Read imperatively
 * by date/number formatters; components re-render on language change, so the
 * next render picks up the new locale.
 */
export function currentLocale(): string {
  return BCP47[useSettingsStore.getState().language] ?? 'es';
}
