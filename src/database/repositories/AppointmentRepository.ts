import { decryptField, encryptField } from '../../utils/fieldCrypto';
import type { Appointment } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/** Encapsulates all SQL for the `appointments` (citas médicas) table. */
export class AppointmentRepository extends BaseRepository<Appointment> {
  protected readonly tableName = 'appointments';

  protected mapDomain(row: Row): EntityColumns<Appointment> {
    return {
      profileId: row.profile_id as string,
      doctor: row.doctor as string,
      date: row.date as string,
      time: row.time as string,
      remindDay: Boolean(row.remind_day),
      remindHour: Boolean(row.remind_hour),
      remindAt: Boolean(row.remind_at),
      notes: decryptField((row.notes as string) ?? null),
    };
  }

  protected toColumns(entity: EntityColumns<Appointment>): Row {
    return {
      profile_id: entity.profileId,
      doctor: entity.doctor,
      date: entity.date,
      time: entity.time,
      remind_day: entity.remindDay ? 1 : 0,
      remind_hour: entity.remindHour ? 1 : 0,
      remind_at: entity.remindAt ? 1 : 0,
      notes: encryptField(entity.notes),
    };
  }

  /** All non-deleted appointments, chronologically (soonest first). */
  async findAllChronological(): Promise<Appointment[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName}
        WHERE deleted_at IS NULL
        ORDER BY date ASC, time ASC`,
    );
    return rows.map((r) => this.mapRow(r));
  }
}

export const appointmentRepository = new AppointmentRepository();
