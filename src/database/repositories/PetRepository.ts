import type { AgeUnit, Pet } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/** Encapsulates all SQL for the `pets` (mascotas) table. */
export class PetRepository extends BaseRepository<Pet> {
  protected readonly tableName = 'pets';

  protected mapDomain(row: Row): EntityColumns<Pet> {
    return {
      userId: row.user_id as string,
      name: row.name as string,
      animalType: row.animal_type as string,
      breed: (row.breed as string) ?? null,
      age: (row.age as string) ?? null,
      ageUnit: (row.age_unit as AgeUnit) ?? 'y',
      weight: (row.weight as number) ?? null,
      color: row.color as string,
      initial: row.initial as string,
      photo: (row.photo as string) ?? null,
    };
  }

  protected toColumns(entity: EntityColumns<Pet>): Row {
    return {
      user_id: entity.userId,
      name: entity.name,
      animal_type: entity.animalType,
      breed: entity.breed,
      age: entity.age,
      age_unit: entity.ageUnit,
      weight: entity.weight,
      color: entity.color,
      initial: entity.initial,
      photo: entity.photo,
    };
  }

  /** All pets of a user, oldest-created first. */
  async findByUserId(userId: string): Promise<Pet[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName}
        WHERE user_id = ? AND deleted_at IS NULL
        ORDER BY created_at ASC`,
      [userId],
    );
    return rows.map((r) => this.mapRow(r));
  }
}

export const petRepository = new PetRepository();
