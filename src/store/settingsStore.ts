import { create } from 'zustand';

import { DEFAULT_LANGUAGE, type Language } from '../constants/config';
import { settingsRepository } from '../database/repositories/SettingsRepository';
import type { ThemeMode } from '../theme';

const KEYS = {
  theme: 'app.theme',
  language: 'app.language',
  accent: 'app.accent',
  sound: 'app.sound',
  notifications: 'app.notifications',
} as const;

interface SettingsState {
  theme: ThemeMode;
  language: Language;
  accent: string | null;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  hydrated: boolean;
  /** Loads persisted preferences from SQLite. Call once after DB init. */
  hydrate: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setAccent: (accent: string | null) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  language: DEFAULT_LANGUAGE,
  accent: null,
  soundEnabled: true,
  notificationsEnabled: false,
  hydrated: false,

  hydrate: async () => {
    const all = await settingsRepository.getAll();
    set({
      theme: (all[KEYS.theme] as ThemeMode) ?? 'light',
      language: (all[KEYS.language] as Language) ?? DEFAULT_LANGUAGE,
      accent: all[KEYS.accent] ?? null,
      soundEnabled: all[KEYS.sound] !== '0',
      notificationsEnabled: all[KEYS.notifications] === '1',
      hydrated: true,
    });
  },

  setTheme: async (theme) => {
    set({ theme });
    await settingsRepository.set(KEYS.theme, theme);
  },

  setLanguage: async (language) => {
    set({ language });
    await settingsRepository.set(KEYS.language, language);
  },

  setAccent: async (accent) => {
    set({ accent });
    await settingsRepository.set(KEYS.accent, accent ?? '');
  },

  setSoundEnabled: async (enabled) => {
    set({ soundEnabled: enabled });
    await settingsRepository.set(KEYS.sound, enabled ? '1' : '0');
  },

  setNotificationsEnabled: async (enabled) => {
    set({ notificationsEnabled: enabled });
    await settingsRepository.set(KEYS.notifications, enabled ? '1' : '0');
  },
}));
