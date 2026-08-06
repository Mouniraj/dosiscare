import type { PetVaccine } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/** All SQL for the `pet_vaccines` table. */
export class PetVaccineRepository extends BaseRepository<PetVaccine> {
  protected readonly tableName = 'pet_vaccines';

  protected mapDomain(row: Row): EntityColumns<PetVaccine> {
    return {
      petId: row.pet_id as string,
      name: row.name as string,
      date: row.date as string,
      alarm: Boolean(row.alarm),
    };
  }

  protected toColumns(entity: EntityColumns<PetVaccine>): Row {
    return {
      pet_id: entity.petId,
      name: entity.name,
      date: entity.date,
      alarm: entity.alarm ? 1 : 0,
    };
  }

  async findByPetId(petId: string): Promise<PetVaccine[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName} WHERE pet_id = ? AND deleted_at IS NULL ORDER BY date DESC`,
      [petId],
    );
    return rows.map((r) => this.mapRow(r));
  }
}

export const petVaccineRepository = new PetVaccineRepository();
