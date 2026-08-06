import type { DoseHistory } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/**
 * Encapsulates all SQL for the `dose_history` table. `profile_id` here is the
 * generic owner id (person or pet), matching the polymorphic medications table.
 */
export class DoseHistoryRepository extends BaseRepository<DoseHistory> {
  protected readonly tableName = 'dose_history';

  protected mapDomain(row: Row): EntityColumns<DoseHistory> {
    return {
      medicationId: row.medication_id as string,
      profileId: row.profile_id as string,
      scheduledAt: row.scheduled_at as number,
      actualAt: (row.actual_at as number) ?? null,
      caregiverId: (row.caregiver_id as string) ?? null,
      status: row.status as DoseHistory['status'],
    };
  }

  protected toColumns(entity: EntityColumns<DoseHistory>): Row {
    return {
      medication_id: entity.medicationId,
      profile_id: entity.profileId,
      scheduled_at: entity.scheduledAt,
      actual_at: entity.actualAt,
      caregiver_id: entity.caregiverId,
      status: entity.status,
    };
  }

  /** All logs, most recent scheduled dose first. */
  async findAllRecent(): Promise<DoseHistory[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName}
        WHERE deleted_at IS NULL
        ORDER BY scheduled_at DESC`,
    );
    return rows.map((r) => this.mapRow(r));
  }

  /** Logs whose scheduled time falls in [from, to) — for a day's agenda merge. */
  async findByScheduledRange(from: number, to: number): Promise<DoseHistory[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName}
        WHERE scheduled_at >= ? AND scheduled_at < ? AND deleted_at IS NULL`,
      [from, to],
    );
    return rows.map((r) => this.mapRow(r));
  }
}

export const doseHistoryRepository = new DoseHistoryRepository();
