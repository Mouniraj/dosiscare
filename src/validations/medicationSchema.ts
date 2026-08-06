import { z } from 'zod';

import type { TFn } from '../i18n';
import type { MedicationInput } from '../services/MedicationService';

/** Medication form schema factory (localized messages). */
export function makeMedicationSchema(t: TFn) {
  const rangeText = (min: number, max: number, message: string) =>
    z
      .string()
      .trim()
      .refine((v) => {
        const n = Number(v);
        return v !== '' && !Number.isNaN(n) && n >= min && n <= max;
      }, message);

  return z.object({
    name: z.string().trim().min(2, t('val.medNameRequired')),
    form: z.enum(['pill', 'syrup', 'capsule', 'drops', 'injection']),
    dose: z.string().trim().min(1, t('val.doseRequired')),
    intervalHours: rangeText(1, 72, t('val.hoursRange')),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, t('val.timeFormat')),
    durationDays: rangeText(1, 365, t('val.daysRange')),
    treatmentKind: z.enum(['permanent', 'temporary']),
  });
}

export type MedicationFormValues = z.infer<ReturnType<typeof makeMedicationSchema>>;

export function toMedicationInput(v: MedicationFormValues, startDate: string): MedicationInput {
  return {
    name: v.name.trim(),
    form: v.form,
    dose: v.dose.trim(),
    intervalHours: Number(v.intervalHours),
    startTime: v.startTime,
    durationDays: Number(v.durationDays),
    treatmentKind: v.treatmentKind,
    startDate,
  };
}
