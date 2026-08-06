import type { PersonVaccine, ReminderCadence } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/** All SQL for the `person_vaccines` table. */
export class PersonVaccineRepository extends BaseRepository<PersonVaccine> {
  protected readonly tableName = 'person_vaccines';

  protected mapDomain(row: Row): EntityColumns<PersonVaccine> {
    return {
      profileId: row.profile_id as string,
      name: row.name as string,
      date: row.date as string,
      reminder: row.reminder as ReminderCadence,
    };
  }

  protected toColumns(entity: EntityColumns<PersonVaccine>): Row {
    return {
      profile_id: entity.profileId,
      name: entity.name,
      date: entity.date,
      reminder: entity.reminder,
    };
  }

  async findByProfileId(profileId: string): Promise<PersonVaccine[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName} WHERE profile_id = ? AND deleted_at IS NULL ORDER BY date DESC`,
      [profileId],
    );
    return rows.map((r) => this.mapRow(r));
  }
}

export const personVaccineRepository = new PersonVaccineRepository();
