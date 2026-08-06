import type * as SQLite from 'expo-sqlite';

import type { SyncMetadata } from '../../types/sync';
import { generateId, now } from '../../utils/id';
import { getDatabase } from '../connection';

export type SqlValue = string | number | null;
export type Row = Record<string, SqlValue>;

/** The sync columns are managed by the base class, never by subclasses. */
export type EntityColumns<T> = Omit<T, keyof SyncMetadata>;

/**
 * Generic repository encapsulating all SQL for one table. Subclasses declare the
 * table name and the row<->model mapping; the base class owns id generation,
 * timestamps, sync-status transitions, and soft deletes.
 *
 * No screen or service should ever write SQL directly — go through a repository.
 */
export abstract class BaseRepository<T extends SyncMetadata> {
  protected abstract readonly tableName: string;

  /** Maps a raw DB row to a domain model (excluding sync fields, added by base). */
  protected abstract mapDomain(row: Row): EntityColumns<T>;

  /** Maps the domain-specific fields of a model to DB columns (excluding sync). */
  protected abstract toColumns(entity: EntityColumns<T>): Row;

  protected get db(): SQLite.SQLiteDatabase {
    return getDatabase();
  }

  protected mapRow(row: Row): T {
    const sync: SyncMetadata = {
      id: row.id as string,
      serverId: (row.server_id as string) ?? null,
      syncStatus: row.sync_status as SyncMetadata['syncStatus'],
      createdAt: row.created_at as number,
      updatedAt: row.updated_at as number,
      deletedAt: (row.deleted_at as number) ?? null,
    };
    return { ...this.mapDomain(row), ...sync } as T;
  }

  /** All non-deleted rows. */
  async findAll(): Promise<T[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    );
    return rows.map((r) => this.mapRow(r));
  }

  /** Non-deleted rows matching a single equality filter. */
  async findWhere(column: string, value: SqlValue): Promise<T[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName} WHERE ${column} = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [value],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findById(id: string): Promise<T | null> {
    const row = await this.db.getFirstAsync<Row>(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return row ? this.mapRow(row) : null;
  }

  async create(entity: EntityColumns<T>): Promise<T> {
    const columns = this.toColumns(entity);
    const timestamp = now();
    const record: Row = {
      ...columns,
      id: generateId(),
      server_id: null,
      sync_status: 'pending',
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
    await this.insertRow(record);
    return this.mapRow(record);
  }

  async update(id: string, patch: Partial<EntityColumns<T>>): Promise<void> {
    const columns = this.toColumns(patch as EntityColumns<T>);
    const keys = Object.keys(columns);
    if (keys.length === 0) return;

    const assignments = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => columns[k]);
    // Preserve 'pending' (never synced) so it isn't demoted to 'updated'.
    await this.db.runAsync(
      `UPDATE ${this.tableName}
         SET ${assignments}, updated_at = ?,
             sync_status = CASE WHEN sync_status = 'pending' THEN 'pending' ELSE 'updated' END
       WHERE id = ?`,
      [...values, now(), id],
    );
  }

  /** Soft delete: marks the row deleted and pending server removal. */
  async softDelete(id: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE ${this.tableName} SET deleted_at = ?, updated_at = ?, sync_status = 'deleted' WHERE id = ?`,
      [now(), now(), id],
    );
  }

  /** Called by the SyncService after a successful push. */
  async markSynced(id: string, serverId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE ${this.tableName} SET sync_status = 'synced', server_id = ? WHERE id = ?`,
      [serverId, id],
    );
  }

  /** Rows awaiting synchronization, for the SyncService to drain. */
  async findUnsynced(): Promise<T[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName} WHERE sync_status != 'synced'`,
    );
    return rows.map((r) => this.mapRow(r));
  }

  /** Number of rows not yet in sync — powers the pending-changes indicator. */
  async countUnsynced(): Promise<number> {
    const row = await this.db.getFirstAsync<{ n: number }>(
      `SELECT COUNT(*) AS n FROM ${this.tableName} WHERE sync_status != 'synced'`,
    );
    return row?.n ?? 0;
  }

  /** Marks a row as failed so the next sync retries it. */
  async markSyncError(id: string): Promise<void> {
    await this.db.runAsync(`UPDATE ${this.tableName} SET sync_status = 'error' WHERE id = ?`, [id]);
  }

  /** Physically removes a row — used after the server confirms a deletion. */
  async hardDelete(id: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  private async insertRow(record: Row): Promise<void> {
    const keys = Object.keys(record);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((k) => record[k]);
    await this.db.runAsync(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
      values,
    );
  }
}
