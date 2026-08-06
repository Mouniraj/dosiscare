import { z } from 'zod';

import type { TFn } from '../i18n';
import type { PersonVaccineInput, PetVaccineInput } from '../services/VaccineService';

/** One schema serving both person (reminder) and pet (alarm) vaccine forms. */
export function makeVaccineSchema(t: TFn) {
  return z.object({
    name: z.string().trim().min(2, t('val.vaccineName')),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('val.dateFormat')),
    reminder: z.enum(['once', 'daily', 'weekly', 'monthly']),
    alarm: z.boolean(),
  });
}

export type VaccineFormValues = z.infer<ReturnType<typeof makeVaccineSchema>>;

export function toPersonVaccineInput(v: VaccineFormValues): PersonVaccineInput {
  return { name: v.name.trim(), date: v.date, reminder: v.reminder };
}

export function toPetVaccineInput(v: VaccineFormValues): PetVaccineInput {
  return { name: v.name.trim(), date: v.date, alarm: v.alarm };
}
