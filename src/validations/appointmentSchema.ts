import { z } from 'zod';

import type { TFn } from '../i18n';
import type { AppointmentInput } from '../services/AppointmentService';

/** Appointment form schema factory (localized messages). */
export function makeAppointmentSchema(t: TFn) {
  return z.object({
    profileId: z.string().min(1, t('val.selectPerson')),
    doctor: z.string().trim().min(2, t('val.doctorRequired')),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('val.dateFormat')),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, t('val.timeFormat')),
    remindDay: z.boolean(),
    remindHour: z.boolean(),
    remindAt: z.boolean(),
    notes: z.string().trim(),
  });
}

export type AppointmentFormValues = z.infer<ReturnType<typeof makeAppointmentSchema>>;

export function toAppointmentInput(v: AppointmentFormValues): AppointmentInput {
  return {
    profileId: v.profileId,
    doctor: v.doctor.trim(),
    date: v.date,
    time: v.time,
    remindDay: v.remindDay,
    remindHour: v.remindHour,
    remindAt: v.remindAt,
    notes: v.notes.trim() === '' ? null : v.notes.trim(),
  };
}
