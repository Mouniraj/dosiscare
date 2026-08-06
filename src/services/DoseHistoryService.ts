import type { DoseHistory, DoseStatus, OwnerType } from '../database/models';
import {
  doseHistoryRepository,
  medicationRepository,
  petRepository,
  profileRepository,
} from '../database/repositories';

export interface LogDoseInput {
  medicationId: string;
  ownerId: string;
  scheduledAt: number;
  status: DoseStatus;
}

/** A dose log enriched with medication + owner display fields. */
export interface DoseHistoryEntry extends DoseHistory {
  medicationName: string;
  ownerName: string;
  ownerColor: string;
  ownerInitial: string;
  ownerType: OwnerType;
}

/** Log status keyed by `${medicationId}-${scheduledAt}` for a day's agenda. */
export interface DayLog {
  id: string;
  status: DoseStatus;
}

const dayBounds = (dateIso: string): [number, number] => {
  const start = new Date(`${dateIso}T00:00:00`).getTime();
  return [start, start + 86_400_000];
};

/**
 * Domain service for dose logging. Marking a dose creates (or updates) a
 * dose_history row; the agenda is derived, so history is the source of truth for
 * what actually happened.
 */
export const DoseHistoryService = {
  /** Marks a scheduled dose; replaces any prior log for the same occurrence. */
  async logDose({ medicationId, ownerId, scheduledAt, status }: LogDoseInput): Promise<void> {
    const existing = (await doseHistoryRepository.findByScheduledRange(scheduledAt, scheduledAt + 1)).find(
      (l) => l.medicationId === medicationId,
    );
    if (existing) {
      await doseHistoryRepository.update(existing.id, { status, actualAt: Date.now() });
      return;
    }
    await doseHistoryRepository.create({
      medicationId,
      profileId: ownerId,
      scheduledAt,
      actualAt: Date.now(),
      caregiverId: null,
      status,
    });
  },

  /** Removes a dose log (undo). */
  undo(id: string): Promise<void> {
    return doseHistoryRepository.softDelete(id);
  },

  /** Map of logged doses for a day, keyed by medication + scheduled time. */
  async getDayLogs(dateIso: string): Promise<Record<string, DayLog>> {
    const [from, to] = dayBounds(dateIso);
    const logs = await doseHistoryRepository.findByScheduledRange(from, to);
    const map: Record<string, DayLog> = {};
    for (const log of logs) {
      map[`${log.medicationId}-${log.scheduledAt}`] = { id: log.id, status: log.status };
    }
    return map;
  },

  /** Full history for the user's medications, enriched and most-recent first. */
  async list(userId: string): Promise<DoseHistoryEntry[]> {
    const [profiles, pets] = await Promise.all([
      profileRepository.findByUserId(userId),
      petRepository.findByUserId(userId),
    ]);
    const owners = new Map<string, { name: string; color: string; initial: string; type: OwnerType }>();
    profiles.forEach((p) => owners.set(p.id, { name: p.name, color: p.color, initial: p.initial, type: 'person' }));
    pets.forEach((p) => owners.set(p.id, { name: p.name, color: p.color, initial: p.initial, type: 'pet' }));

    const meds = await medicationRepository.findAll();
    const medById = new Map(meds.map((m) => [m.id, m]));

    const logs = await doseHistoryRepository.findAllRecent();
    return logs
      .filter((l) => owners.has(l.profileId))
      .map((l) => {
        const owner = owners.get(l.profileId)!;
        return {
          ...l,
          medicationName: medById.get(l.medicationId)?.name ?? 'Medicamento',
          ownerName: owner.name,
          ownerColor: owner.color,
          ownerInitial: owner.initial,
          ownerType: owner.type,
        };
      });
  },
};
