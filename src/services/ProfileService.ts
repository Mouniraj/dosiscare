import { pickProfileColor } from '../constants/profiles';
import type { Profile } from '../database/models';
import { profileRepository } from '../database/repositories';
import { useSessionStore } from '../store/sessionStore';
import { ageFromBirthDate } from '../utils/date';
import { initialFromName } from '../utils/format';

export interface ProfileInput {
  name: string;
  ageNum: number | null;
  birthDate: string | null;
  weight: number | null;
  height: number | null;
  allergy: string | null;
  role: string | null;
  photo?: string | null;
}

/**
 * Domain service for personas. CRUD runs against SQLite today; when a backend
 * exists it will try `profileApi` first with this as the offline fallback.
 * Screens/hooks go through this service, never the repository directly.
 */
export const ProfileService = {
  list(userId: string): Promise<Profile[]> {
    return profileRepository.findByUserId(userId);
  },

  /** Fetches a persona, scoped to the current user (defense in depth). */
  async get(id: string): Promise<Profile | null> {
    const profile = await profileRepository.findById(id);
    if (!profile) return null;
    const userId = useSessionStore.getState().user?.id;
    if (userId && profile.userId !== userId) return null;
    return profile;
  },

  /** Creates a family-member persona (non-holder). */
  async create(userId: string, input: ProfileInput): Promise<Profile> {
    return createProfile(userId, input, false);
  },

  /**
   * Creates the account holder's own persona (isOwner=true). Called once from
   * the registration flow so the titular appears in Personas immediately.
   */
  async createHolder(userId: string, input: ProfileInput): Promise<Profile> {
    return createProfile(userId, input, true);
  },

  async update(id: string, input: ProfileInput): Promise<void> {
    const derivedAge = input.birthDate ? ageFromBirthDate(input.birthDate) : input.ageNum;
    await profileRepository.update(id, {
      name: input.name.trim(),
      ageNum: derivedAge,
      birthDate: input.birthDate,
      weight: input.weight,
      height: input.height,
      allergy: input.allergy,
      role: input.role,
      initial: initialFromName(input.name),
    });
  },

  remove(id: string): Promise<void> {
    return profileRepository.softDelete(id);
  },
};

async function createProfile(
  userId: string,
  input: ProfileInput,
  isOwner: boolean,
): Promise<Profile> {
  const existing = await profileRepository.findByUserId(userId);
  const derivedAge = input.birthDate ? ageFromBirthDate(input.birthDate) : input.ageNum;
  return profileRepository.create({
    userId,
    name: input.name.trim(),
    ageNum: derivedAge,
    birthDate: input.birthDate,
    weight: input.weight,
    height: input.height,
    allergy: input.allergy,
    role: input.role,
    color: pickProfileColor(existing.length),
    initial: initialFromName(input.name),
    photo: input.photo ?? null,
    isOwner,
  });
}
