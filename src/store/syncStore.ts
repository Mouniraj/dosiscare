import { create } from 'zustand';

import { SyncService, type SyncResult } from '../services/SyncService';

interface SyncState {
  pending: number;
  isSyncing: boolean;
  offline: boolean;
  lastSyncedAt: number | null;
  /** Recomputes the pending-changes count from SQLite. */
  refreshPending: () => Promise<void>;
  /** Attempts to drain pending changes to the backend. */
  syncNow: () => Promise<SyncResult>;
}

/**
 * UI-facing sync state. SQLite remains authoritative; this store only reflects
 * how many local changes await the (future) backend and the last attempt's outcome.
 */
export const useSyncStore = create<SyncState>((set) => ({
  pending: 0,
  isSyncing: false,
  offline: false,
  lastSyncedAt: null,

  refreshPending: async () => {
    const pending = await SyncService.getPendingCount();
    set({ pending });
  },

  syncNow: async () => {
    set({ isSyncing: true });
    const result = await SyncService.syncAll();
    set({
      isSyncing: false,
      pending: result.pending,
      offline: result.offline,
      lastSyncedAt: result.offline ? null : Date.now(),
    });
    return result;
  },
}));
