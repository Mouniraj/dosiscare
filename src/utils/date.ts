import { currentLocale } from '../i18n/locale';

/** Calendar-date helpers operating on ISO date strings (YYYY-MM-DD). */

/** Whole years between an ISO birth date and today, or null if invalid. */
export function ageFromBirthDate(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const b = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(b.getTime())) return null;
  const t = new Date();
  let years = t.getFullYear() - b.getFullYear();
  const beforeBirthdayThisYear =
    t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate());
  if (beforeBirthdayThisYear) years -= 1;
  return years >= 0 && years < 130 ? years : null;
}

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

/** "Lunes 27 de julio, 2026" — capitalized weekday + year, active language. */
export function formatDateFullYear(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const locale = currentLocale();
  const weekdayRaw = d.toLocaleDateString(locale, { weekday: 'long' });
  const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);
  const dayMonth = d.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  return `${weekday} ${dayMonth}, ${d.getFullYear()}`;
}

/** Greeting key based on local hour: morning (5-11), afternoon (12-18), evening (else). */
export function greetingKey(date: Date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 19) return 'afternoon';
  return 'evening';
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

/** Monday (as ISO date) of the ISO week containing `iso`. */
export function mondayOfWeek(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const dow = (d.getDay() + 6) % 7; // 0 = Monday .. 6 = Sunday
  d.setDate(d.getDate() - dow);
  return d.toISOString().slice(0, 10);
}

/** Human short weekday, capitalized (e.g. "Lun"). */
export function weekdayShort(iso: string): string {
  const s = new Date(`${iso}T00:00:00`).toLocaleDateString(currentLocale(), { weekday: 'short' });
  const clean = s.replace('.', '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/** Month + year label in the active language, e.g. "agosto 2026". */
export function formatMonthYear(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(currentLocale(), {
    month: 'long',
    year: 'numeric',
  });
}

/** ISO date string for the first day of the month containing `iso`. */
export function firstOfMonth(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

/** Number of days in the calendar month containing `iso`. */
export function daysInMonth(iso: string): number {
  const d = new Date(`${iso}T00:00:00`);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Weekday number (0 = Monday .. 6 = Sunday) for `iso`. */
export function dowMondayFirst(iso: string): number {
  return (new Date(`${iso}T00:00:00`).getDay() + 6) % 7;
}
