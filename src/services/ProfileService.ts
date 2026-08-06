import { pickProfileColor } from '../constants/profiles';
import type { Profile } from '../database/models';
import { profileRepository } from '../database/repositories';
import { useSessionStore } from '../store/sessionStore';
import { initialFromName } from '../utils/format';

export interface ProfileInput {
  name: string;
  ageNum: number | null;
  weight: number | null;
  height: number | null;
  allergy: string | null;
  role: string | null;
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

  async create(userId: string, input: ProfileInput): Promise<Profile> {
    const existing = await profileRepository.findByUserId(userId);
    return profileRepository.create({
      userId,
      name: input.name.trim(),
      ageNum: input.ageNum,
      weight: input.weight,
      height: input.height,
      allergy: input.allergy,
      role: input.role,
      color: pickProfileColor(existing.length),
      initial: initialFromName(input.name),
      photo: null,
      isOwner: false,
    });
  },

  async update(id: string, input: ProfileInput): Promise<void> {
    await profileRepository.update(id, {
      name: input.name.trim(),
      ageNum: input.ageNum,
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
