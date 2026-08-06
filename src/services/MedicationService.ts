import type { Medication, MedicationForm, OwnerType, TreatmentKind } from '../database/models';
import { medicationRepository } from '../database/repositories';
import { iconForForm } from '../utils/medication';

export interface MedicationInput {
  name: string;
  form: MedicationForm;
  dose: string;
  intervalHours: number;
  startTime: string;
  durationDays: number;
  treatmentKind: TreatmentKind;
  startDate: string;
}

/**
 * Domain service for medications (person or pet). CRUD runs against SQLite;
 * structured to later sync via `medicationApi`. The icon is derived from the
 * chosen form, and new treatments start active/on-track.
 */
export const MedicationService = {
  listByOwner(ownerType: OwnerType, ownerId: string): Promise<Medication[]> {
    return medicationRepository.findByOwner(ownerType, ownerId);
  },

  get(id: string): Promise<Medication | null> {
    return medicationRepository.findById(id);
  },

  create(ownerType: OwnerType, ownerId: string, input: MedicationInput): Promise<Medication> {
    return medicationRepository.create({
      ownerType,
      ownerId,
      ...input,
      name: input.name.trim(),
      icon: iconForForm(input.form),
      isActive: true,
      status: 'ok',
    });
  },

  async update(id: string, input: MedicationInput): Promise<void> {
    await medicationRepository.update(id, {
      ...input,
      name: input.name.trim(),
      icon: iconForForm(input.form),
    });
  },

  setActive(id: string, isActive: boolean): Promise<void> {
    return medicationRepository.update(id, { isActive });
  },

  remove(id: string): Promise<void> {
    return medicationRepository.softDelete(id);
  },
};
