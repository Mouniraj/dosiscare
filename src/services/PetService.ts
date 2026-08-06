import { pickProfileColor } from '../constants/profiles';
import type { AgeUnit, Pet } from '../database/models';
import { petRepository } from '../database/repositories';
import { useSessionStore } from '../store/sessionStore';
import { initialFromName } from '../utils/format';

export interface PetInput {
  name: string;
  animalType: string;
  breed: string | null;
  age: string | null;
  ageUnit: AgeUnit;
  weight: number | null;
}

/**
 * Domain service for pets (mascotas). CRUD runs against SQLite; structured to
 * later sync via `petApi`. Screens/hooks go through this service.
 */
export const PetService = {
  list(userId: string): Promise<Pet[]> {
    return petRepository.findByUserId(userId);
  },

  /** Fetches a pet, scoped to the current user (defense in depth). */
  async get(id: string): Promise<Pet | null> {
    const pet = await petRepository.findById(id);
    if (!pet) return null;
    const userId = useSessionStore.getState().user?.id;
    if (userId && pet.userId !== userId) return null;
    return pet;
  },

  async create(userId: string, input: PetInput): Promise<Pet> {
    const existing = await petRepository.findByUserId(userId);
    return petRepository.create({
      userId,
      name: input.name.trim(),
      animalType: input.animalType,
      breed: input.breed,
      age: input.age,
      ageUnit: input.ageUnit,
      weight: input.weight,
      color: pickProfileColor(existing.length + 3),
      initial: initialFromName(input.name),
      photo: null,
    });
  },

  async update(id: string, input: PetInput): Promise<void> {
    await petRepository.update(id, {
      name: input.name.trim(),
      animalType: input.animalType,
      breed: input.breed,
      age: input.age,
      ageUnit: input.ageUnit,
      weight: input.weight,
      initial: initialFromName(input.name),
    });
  },

  remove(id: string): Promise<void> {
    return petRepository.softDelete(id);
  },
};
