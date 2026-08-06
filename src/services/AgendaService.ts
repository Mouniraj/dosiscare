import type { OwnerType } from '../database/models';
import { medicationRepository, petRepository, profileRepository } from '../database/repositories';
import { doseOccurrencesOnDate } from '../utils/agenda';

/** A single scheduled dose on a given day, resolved to its owner for display. */
export interface DoseEvent {
  key: string;
  time: string;
  /** Epoch ms of the scheduled dose — used to match dose-history logs. */
  scheduledAt: number;
  medicationId: string;
  medicationName: string;
  dose: string;
  ownerType: OwnerType;
  ownerId: string;
  ownerName: string;
  ownerColor: string;
  ownerInitial: string;
}

interface OwnerInfo {
  name: string;
  color: string;
  initial: string;
  type: OwnerType;
}

/**
 * Builds the medication agenda for a date by expanding every active treatment
 * (persons + pets) into its individual dose times. Pure derivation over SQLite —
 * no schedule table is stored; the timeline is computed on demand.
 */
export const AgendaService = {
  async getDayEvents(userId: string, dateIso: string): Promise<DoseEvent[]> {
    const [profiles, pets] = await Promise.all([
      profileRepository.findByUserId(userId),
      petRepository.findByUserId(userId),
    ]);

    const owners = new Map<string, OwnerInfo>();
    profiles.forEach((p) => owners.set(p.id, { name: p.name, color: p.color, initial: p.initial, type: 'person' }));
    pets.forEach((p) => owners.set(p.id, { name: p.name, color: p.color, initial: p.initial, type: 'pet' }));

    const meds = await medicationRepository.findAll();
    const events: DoseEvent[] = [];

    for (const med of meds) {
      if (!med.isActive) continue;
      const owner = owners.get(med.ownerId);
      if (!owner) continue;
      for (const occ of doseOccurrencesOnDate(med, dateIso)) {
        events.push({
          key: `${med.id}-${occ.at}`,
          time: occ.time,
          scheduledAt: occ.at,
          medicationId: med.id,
          medicationName: med.name,
          dose: med.dose,
          ownerType: owner.type,
          ownerId: med.ownerId,
          ownerName: owner.name,
          ownerColor: owner.color,
          ownerInitial: owner.initial,
        });
      }
    }

    return events.sort((a, b) => a.scheduledAt - b.scheduledAt);
  },
};
