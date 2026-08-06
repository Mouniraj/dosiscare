import { create } from 'zustand';

import type { User } from '../database/models';

interface SessionState {
  user: User | null;
  /** Index/id of the currently selected profile in multi-profile views. */
  selectedProfileId: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSelectedProfile: (profileId: string | null) => void;
  signOut: () => void;
}

/**
 * Non-persistent session state. The authoritative user record lives in SQLite;
 * this store holds the active session for the UI to avoid prop drilling.
 */
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  selectedProfileId: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setSelectedProfile: (selectedProfileId) => set({ selectedProfileId }),
  signOut: () => set({ user: null, selectedProfileId: null, isAuthenticated: false }),
}));
