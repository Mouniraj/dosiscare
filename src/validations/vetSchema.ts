import { z } from 'zod';

import type { TFn } from '../i18n';
import type { VetAppointmentInput } from '../services/VetAppointmentService';

export function makeVetSchema(t: TFn) {
  return z.object({
    vet: z.string().trim().min(2, t('val.vetRequired')),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('val.dateFormat')),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, t('val.timeFormat')),
    description: z.string().trim(),
  });
}

export type VetFormValues = z.infer<ReturnType<typeof makeVetSchema>>;

export function toVetInput(v: VetFormValues): VetAppointmentInput {
  return {
    vet: v.vet.trim(),
    date: v.date,
    time: v.time,
    description: v.description.trim() === '' ? null : v.description.trim(),
  };
}
