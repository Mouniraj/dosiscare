import * as SQLite from 'expo-sqlite';

import { DATABASE_NAME } from '../../constants/config';
import { runMigrations } from '../migrations';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Opens (once) the SQLite database, applies pragmas, and runs pending migrations.
 * Concurrent callers share a single in-flight initialization promise.
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    // Durability + referential integrity for offline use.
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);
    await runMigrations(db);
    dbInstance = db;
    return db;
  })();

  return initPromise;
}

/**
 * Returns the initialized database. Repositories call this; it throws if the app
 * boot sequence has not initialized the DB yet, surfacing wiring mistakes early.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() during app boot.');
  }
  return dbInstance;
}

/** Test/utility hook to close and reset the singleton. */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    initPromise = null;
  }
}
