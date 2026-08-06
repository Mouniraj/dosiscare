import type * as SQLite from 'expo-sqlite';

import { migration001 } from './001_initial';
import type { Migration } from './types';

export type { Migration } from './types';

/**
 * Ordered list of migrations. Append new ones with an incrementing `version`;
 * never edit a released migration — add a new one instead.
 */
const migrations: Migration[] = [migration001];

interface UserVersionRow {
  user_version: number;
}

/**
 * Applies every migration whose version is greater than the DB's current
 * `PRAGMA user_version`, each inside its own transaction, then bumps the version.
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<UserVersionRow>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  const pending = migrations
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.up);
    });
    // user_version does not accept bound params; version is an internal integer.
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
  }
}
