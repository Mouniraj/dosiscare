import type { DoseStatus, Medication, MedicationForm, MedicationStatus } from '../database/models';
import type { TFn, TranslationKey } from './index';

const PET_TYPE_KEYS = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'other'];

/** "3 años" / "3 years" / "3 anos" — localized age with unit. */
export function ageLabel(t: TFn, n: number | null): string {
  if (n === null || Number.isNaN(n)) return t('age.unknown');
  return `${n} ${t(n === 1 ? 'age.year' : 'age.years')}`;
}

/** Localized pet age from a numeric string + unit ('y'|'m'). */
export function petAgeLabel(t: TFn, age: string | null, unit: 'y' | 'm'): string {
  if (!age || age.trim() === '') return t('age.unknown');
  const n = Number(age);
  const key: TranslationKey =
    unit === 'm' ? (n === 1 ? 'age.month' : 'age.months') : n === 1 ? 'age.year' : 'age.years';
  return `${age} ${t(key)}`;
}

/** "cada 8 h · 08:00" localized. */
export function scheduleLabel(t: TFn, med: Pick<Medication, 'intervalHours' | 'startTime'>): string {
  return `${t('schedule.every', { h: med.intervalHours })} · ${med.startTime}`;
}

/** "Permanente" or "5 días" localized. */
export function durationLabel(t: TFn, med: Pick<Medication, 'treatmentKind' | 'durationDays'>): string {
  if (med.treatmentKind === 'permanent') return t('schedule.permanent');
  return t(med.durationDays === 1 ? 'schedule.day' : 'schedule.days', { n: med.durationDays });
}

export function medStatusLabel(t: TFn, status: MedicationStatus): string {
  return t(`medStatus.${status}` as TranslationKey);
}

export function doseStatusLabel(t: TFn, status: DoseStatus): string {
  return t(`doseStatus.${status}` as TranslationKey);
}

export function medFormLabel(t: TFn, form: MedicationForm): string {
  return t(`medForm.${form}` as TranslationKey);
}

/** Localized pet type label, defaulting unknown types to "other". */
export function petTypeLabel(t: TFn, type: string): string {
  const key = PET_TYPE_KEYS.includes(type) ? `petType.${type}` : 'petType.other';
  return t(key as TranslationKey);
}

const SYMPTOM_KEY_SET = ['fever', 'headache', 'cough', 'soreThroat', 'nausea', 'vomiting', 'diarrhea', 'fatigue'];

/** Localized label for a predefined symptom key. */
export function symptomLabel(t: TFn, key: string): string {
  return SYMPTOM_KEY_SET.includes(key) ? t(`symptom.${key}` as TranslationKey) : key;
}

/** Comma-joined summary of a symptom log's predefined + custom entries. */
export function symptomSummary(t: TFn, items: string[], custom: string[]): string {
  return [...items.map((k) => symptomLabel(t, k)), ...custom].join(', ');
}
