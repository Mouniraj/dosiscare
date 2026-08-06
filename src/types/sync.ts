/**
 * Offline-First synchronization contract shared by every persisted entity.
 * CRUD always happens against SQLite; these fields let the SyncService reconcile
 * with a backend once connectivity and an API contract exist.
 */

export type SyncStatus =
  | 'pending' // created/modified locally, not yet pushed
  | 'synced' // in sync with server
  | 'updated' // synced before, changed again locally
  | 'deleted' // soft-deleted locally, pending server delete
  | 'error'; // last sync attempt failed

export interface SyncMetadata {
  /** Local UUID primary key — stable offline. */
  id: string;
  /** Server-assigned id, populated after a successful push. */
  serverId: string | null;
  syncStatus: SyncStatus;
  /** epoch ms */
  createdAt: number;
  /** epoch ms */
  updatedAt: number;
  /** epoch ms, set on soft delete. */
  deletedAt: number | null;
}

export type SyncOperation = 'create' | 'update' | 'delete';

/** Columns appended to every domain table. Keep in one place so migrations stay DRY. */
export const SYNC_COLUMNS_SQL = `
  server_id TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
`;
