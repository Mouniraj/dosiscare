import type { Medication, OwnerType } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/** Encapsulates all SQL for the polymorphic `medications` table (person or pet). */
export class MedicationRepository extends BaseRepository<Medication> {
  protected readonly tableName = 'medications';

  protected mapDomain(row: Row): EntityColumns<Medication> {
    return {
      ownerType: row.owner_type as OwnerType,
      ownerId: row.owner_id as string,
      name: row.name as string,
      form: row.form as Medication['form'],
      dose: row.dose as string,
      intervalHours: row.interval_hours as number,
      startTime: row.start_time as string,
      durationDays: row.duration_days as number,
      treatmentKind: row.treatment_kind as Medication['treatmentKind'],
      startDate: row.start_date as string,
      icon: (row.icon as string) ?? 'medication',
      isActive: Boolean(row.is_active),
      status: row.status as Medication['status'],
    };
  }

  protected toColumns(entity: EntityColumns<Medication>): Row {
    return {
      owner_type: entity.ownerType,
      owner_id: entity.ownerId,
      name: entity.name,
      form: entity.form,
      dose: entity.dose,
      interval_hours: entity.intervalHours,
      start_time: entity.startTime,
      duration_days: entity.durationDays,
      treatment_kind: entity.treatmentKind,
      start_date: entity.startDate,
      icon: entity.icon,
      is_active: entity.isActive ? 1 : 0,
      status: entity.status,
    };
  }

  /** All medications belonging to a specific person or pet. */
  async findByOwner(ownerType: OwnerType, ownerId: string): Promise<Medication[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName}
        WHERE owner_type = ? AND owner_id = ? AND deleted_at IS NULL
        ORDER BY is_active DESC, created_at DESC`,
      [ownerType, ownerId],
    );
    return rows.map((r) => this.mapRow(r));
  }
}

export const medicationRepository = new MedicationRepository();
