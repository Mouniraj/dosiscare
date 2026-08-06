import { z } from 'zod';

import type { TFn } from '../i18n';
import type { PetInput } from '../services/PetService';

/** Pet form schema factory (localized messages). */
export function makePetSchema(t: TFn) {
  const numericText = (message: string) =>
    z
      .string()
      .trim()
      .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), message);

  return z.object({
    name: z.string().trim().min(2, t('val.nameRequired')),
    animalType: z.enum(['dog', 'cat', 'bird', 'rabbit', 'fish', 'other']),
    breed: z.string().trim(),
    age: numericText(t('val.ageInvalid')),
    ageUnit: z.enum(['y', 'm']),
    weight: numericText(t('val.weightInvalid')),
  });
}

export type PetFormValues = z.infer<ReturnType<typeof makePetSchema>>;

export function toPetInput(v: PetFormValues): PetInput {
  return {
    name: v.name.trim(),
    animalType: v.animalType,
    breed: v.breed.trim() === '' ? null : v.breed.trim(),
    age: v.age.trim() === '' ? null : v.age.trim(),
    ageUnit: v.ageUnit,
    weight: v.weight.trim() === '' ? null : Number(v.weight),
  };
}
