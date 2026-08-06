import type * as SQLite from 'expo-sqlite';

import { getDatabase } from '../connection';

interface SettingRow {
  key: string;
  value: string | null;
}

/**
 * Key/value repository over the `settings` table. Used for app preferences
 * (theme, language, accent, sync flags) that persist offline.
 */
export class SettingsRepository {
  private get db(): SQLite.SQLiteDatabase {
    return getDatabase();
  }

  async get(key: string): Promise<string | null> {
    const row = await this.db.getFirstAsync<SettingRow>(
      'SELECT value FROM settings WHERE key = ?',
      [key],
    );
    return row?.value ?? null;
  }

  async getAll(): Promise<Record<string, string | null>> {
    const rows = await this.db.getAllAsync<SettingRow>('SELECT key, value FROM settings');
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async set(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, value],
    );
  }
}

export const settingsRepository = new SettingsRepository();
