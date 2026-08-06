import { currentLocale } from '../i18n/locale';

/** Calendar-date helpers operating on ISO date strings (YYYY-MM-DD). */

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isTodayIso(iso: string): boolean {
  return iso === new Date().toISOString().slice(0, 10);
}

/** "27 jul" — short day + month, in the active language. */
export function formatDateShort(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(currentLocale(), { day: 'numeric', month: 'short' });
}

/** "lunes 27 de julio" — full human date, in the active language. */
export function formatDateLong(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(currentLocale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Capitalized weekday in the active language. */
export function weekdayLabel(iso: string): string {
  const w = new Date(`${iso}T00:00:00`).toLocaleDateString(currentLocale(), { weekday: 'long' });
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** True when `iso` falls within [from, from+days). */
export function isWithinRange(iso: string, from: string, days: number): boolean {
  const to = addDaysIso(from, days);
  return iso >= from && iso < to;
}
