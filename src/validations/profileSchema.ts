import { z } from 'zod';

import type { TFn } from '../i18n';
import type { ProfileInput } from '../services/ProfileService';

/** Persona form schema factory (localized messages). Fields stay strings. */
export function makeProfileSchema(t: TFn) {
  const numericText = (message: string) =>
    z
      .string()
      .trim()
      .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), message);

  return z.object({
    name: z.string().trim().min(2, t('val.nameRequired')),
    ageNum: numericText(t('val.ageInvalid')),
    weight: numericText(t('val.weightInvalid')),
    height: numericText(t('val.heightInvalid')),
    allergy: z.string().trim(),
    role: z.string().trim(),
  });
}

export type ProfileFormValues = z.infer<ReturnType<typeof makeProfileSchema>>;

const toNumber = (v: string): number | null => (v.trim() === '' ? null : Number(v));
const toText = (v: string): string | null => (v.trim() === '' ? null : v.trim());

export function toProfileInput(v: ProfileFormValues): ProfileInput {
  return {
    name: v.name.trim(),
    ageNum: toNumber(v.ageNum),
    birthDate: null,
    weight: toNumber(v.weight),
    height: toNumber(v.height),
    allergy: toText(v.allergy),
    role: toText(v.role),
  };
}
