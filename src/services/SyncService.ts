import { BackendUnavailableError } from '../api/errors';
import { appointmentApi } from '../api/services/appointmentApi';
import { medicationApi } from '../api/services/medicationApi';
import { petApi } from '../api/services/petApi';
import { profileApi } from '../api/services/profileApi';
import {
  appointmentRepository,
  doseHistoryRepository,
  medicationRepository,
  personVaccineRepository,
  petRepository,
  petVaccineRepository,
  profileRepository,
  symptomRepository,
  userRepository,
  vetAppointmentRepository,
} from '../database/repositories';
import type { SyncMetadata } from '../types/sync';

/** The subset of a repository the SyncService drives (any entity satisfies it). */
interface SyncRepo {
  findUnsynced(): Promise<SyncMetadata[]>;
  markSynced(id: string, serverId: string): Promise<void>;
  markSyncError(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  countUnsynced(): Promise<number>;
}

/** Push handlers for one entity. Today they hit stubbed APIs (throw offline). */
interface Pusher {
  create: (record: SyncMetadata) => Promise<string>;
  update: (record: SyncMetadata) => Promise<void>;
  remove: (record: SyncMetadata) => Promise<void>;
}

interface SyncResource {
  repo: SyncRepo;
  push: Pusher;
}

/** Entities with no dedicated API yet: draining them is a no-op until one ships. */
const offlinePusher: Pusher = {
  create: async () => {
    throw new BackendUnavailableError();
  },
  update: async () => {
    throw new BackendUnavailableError();
  },
  remove: async () => {
    throw new BackendUnavailableError();
  },
};

const serverIdOf = (r: SyncMetadata): string => r.serverId ?? r.id;

const profilePusher: Pusher = {
  create: async (r) => {
    await profileApi.create(r);
    return `srv_${r.id}`;
  },
  update: async (r) => {
    await profileApi.update(serverIdOf(r), r);
  },
  remove: async (r) => {
    await profileApi.remove(serverIdOf(r));
  },
};

const petPusher: Pusher = {
  create: async (r) => {
    await petApi.create(r);
    return `srv_${r.id}`;
  },
  update: async (r) => {
    await petApi.update(serverIdOf(r), r);
  },
  remove: async (r) => {
    await petApi.remove(serverIdOf(r));
  },
};

const medicationPusher: Pusher = {
  create: async (r) => {
    await medicationApi.create(r);
    return `srv_${r.id}`;
  },
  update: async (r) => {
    await medicationApi.update(serverIdOf(r), r);
  },
  remove: async (r) => {
    await medicationApi.remove(serverIdOf(r));
  },
};

const appointmentPusher: Pusher = {
  create: async (r) => {
    await appointmentApi.create(r);
    return `srv_${r.id}`;
  },
  update: async (r) => {
    await appointmentApi.update(serverIdOf(r), r);
  },
  remove: async (r) => {
    await appointmentApi.remove(serverIdOf(r));
  },
};

/** Every entity that participates in the pending-changes count. */
const ALL_REPOS: SyncRepo[] = [
  userRepository,
  profileRepository,
  petRepository,
  medicationRepository,
  appointmentRepository,
  personVaccineRepository,
  petVaccineRepository,
  vetAppointmentRepository,
  symptomRepository,
  doseHistoryRepository,
];

/** Push order: parents before children so server FKs resolve. */
const RESOURCES: SyncResource[] = [
  { repo: profileRepository, push: profilePusher },
  { repo: petRepository, push: petPusher },
  { repo: medicationRepository, push: medicationPusher },
  { repo: appointmentRepository, push: appointmentPusher },
  { repo: personVaccineRepository, push: offlinePusher },
  { repo: petVaccineRepository, push: offlinePusher },
  { repo: vetAppointmentRepository, push: offlinePusher },
  { repo: symptomRepository, push: offlinePusher },
  { repo: doseHistoryRepository, push: offlinePusher },
];

export interface SyncResult {
  pushed: number;
  pending: number;
  offline: boolean;
}

/**
 * Drains locally-pending changes to the backend. SQLite stays the source of
 * truth; each row's `sync_status` drives whether it's created/updated/deleted
 * remotely. No backend exists yet, so pushes surface as `offline: true` — the
 * architecture is complete and only the API bodies remain to be filled in.
 */
export const SyncService = {
  async getPendingCount(): Promise<number> {
    const counts = await Promise.all(ALL_REPOS.map((r) => r.countUnsynced()));
    return counts.reduce((total, n) => total + n, 0);
  },

  async syncAll(): Promise<SyncResult> {
    let pushed = 0;
    let offline = false;

    for (const { repo, push } of RESOURCES) {
      const records = await repo.findUnsynced();
      for (const record of records) {
        try {
          if (record.syncStatus === 'deleted') {
            await push.remove(record);
            await repo.hardDelete(record.id);
          } else if (record.syncStatus === 'updated') {
            await push.update(record);
            await repo.markSynced(record.id, serverIdOf(record));
          } else {
            const serverId = await push.create(record);
            await repo.markSynced(record.id, serverId);
          }
          pushed += 1;
        } catch (error) {
          if (error instanceof BackendUnavailableError) {
            offline = true;
            const pending = await this.getPendingCount();
            return { pushed, pending, offline };
          }
          await repo.markSyncError(record.id);
        }
      }
    }

    const pending = await this.getPendingCount();
    return { pushed, pending, offline };
  },
};
