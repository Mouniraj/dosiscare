import type { PersonVaccine, PetVaccine, ReminderCadence } from '../database/models';
import { personVaccineRepository, petVaccineRepository } from '../database/repositories';

export interface PersonVaccineInput {
  name: string;
  date: string;
  reminder: ReminderCadence;
}

export interface PetVaccineInput {
  name: string;
  date: string;
  alarm: boolean;
}

/** Domain service for person + pet vaccines (both over SQLite, Offline First). */
export const VaccineService = {
  listPerson(profileId: string): Promise<PersonVaccine[]> {
    return personVaccineRepository.findByProfileId(profileId);
  },
  createPerson(profileId: string, input: PersonVaccineInput): Promise<PersonVaccine> {
    return personVaccineRepository.create({ profileId, ...input, name: input.name.trim() });
  },
  async updatePerson(id: string, input: PersonVaccineInput): Promise<void> {
    await personVaccineRepository.update(id, { ...input, name: input.name.trim() });
  },
  removePerson(id: string): Promise<void> {
    return personVaccineRepository.softDelete(id);
  },

  listPet(petId: string): Promise<PetVaccine[]> {
    return petVaccineRepository.findByPetId(petId);
  },
  createPet(petId: string, input: PetVaccineInput): Promise<PetVaccine> {
    return petVaccineRepository.create({ petId, ...input, name: input.name.trim() });
  },
  async updatePet(id: string, input: PetVaccineInput): Promise<void> {
    await petVaccineRepository.update(id, { ...input, name: input.name.trim() });
  },
  removePet(id: string): Promise<void> {
    return petVaccineRepository.softDelete(id);
  },
};
