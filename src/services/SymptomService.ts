import type { Symptom, TemperatureUnit } from '../database/models';
import { symptomRepository } from '../database/repositories';

export interface SymptomInput {
  items: string[];
  custom: string[];
  temperature: number | null;
  tempUnit: TemperatureUnit;
  note: string | null;
}

/** Domain service for symptom logs per persona (SQLite, Offline First). */
export const SymptomService = {
  list(profileId: string): Promise<Symptom[]> {
    return symptomRepository.findByProfileId(profileId);
  },
  get(id: string): Promise<Symptom | null> {
    return symptomRepository.findById(id);
  },
  create(profileId: string, input: SymptomInput): Promise<Symptom> {
    return symptomRepository.create({ profileId, loggedAt: Date.now(), ...input });
  },
  async update(id: string, input: SymptomInput): Promise<void> {
    await symptomRepository.update(id, input);
  },
  remove(id: string): Promise<void> {
    return symptomRepository.softDelete(id);
  },
};
