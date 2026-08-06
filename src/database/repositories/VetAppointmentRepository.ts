import { decryptField, encryptField } from '../../utils/fieldCrypto';
import type { VetAppointment } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/** All SQL for the `vet_appointments` table. */
export class VetAppointmentRepository extends BaseRepository<VetAppointment> {
  protected readonly tableName = 'vet_appointments';

  protected mapDomain(row: Row): EntityColumns<VetAppointment> {
    return {
      petId: row.pet_id as string,
      vet: row.vet as string,
      date: row.date as string,
      time: row.time as string,
      description: decryptField((row.description as string) ?? null),
    };
  }

  protected toColumns(entity: EntityColumns<VetAppointment>): Row {
    return {
      pet_id: entity.petId,
      vet: entity.vet,
      date: entity.date,
      time: entity.time,
      description: encryptField(entity.description),
    };
  }

  async findByPetId(petId: string): Promise<VetAppointment[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName} WHERE pet_id = ? AND deleted_at IS NULL ORDER BY date ASC, time ASC`,
      [petId],
    );
    return rows.map((r) => this.mapRow(r));
  }
}

export const vetAppointmentRepository = new VetAppointmentRepository();
