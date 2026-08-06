import { decryptField, encryptField } from '../../utils/fieldCrypto';
import type { Symptom, TemperatureUnit } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/** All SQL for the `symptoms` table. `items`/`custom` are stored as JSON arrays. */
export class SymptomRepository extends BaseRepository<Symptom> {
  protected readonly tableName = 'symptoms';

  protected mapDomain(row: Row): EntityColumns<Symptom> {
    return {
      profileId: row.profile_id as string,
      loggedAt: row.logged_at as number,
      items: this.parseArray(decryptField(row.items as string) ?? '[]'),
      custom: this.parseArray(decryptField(row.custom as string) ?? '[]'),
      temperature: (row.temperature as number) ?? null,
      tempUnit: row.temp_unit as TemperatureUnit,
      note: decryptField((row.note as string) ?? null),
    };
  }

  protected toColumns(entity: EntityColumns<Symptom>): Row {
    return {
      profile_id: entity.profileId,
      logged_at: entity.loggedAt,
      items: encryptField(JSON.stringify(entity.items)),
      custom: encryptField(JSON.stringify(entity.custom)),
      temperature: entity.temperature,
      temp_unit: entity.tempUnit,
      note: encryptField(entity.note),
    };
  }

  private parseArray(value: string): string[] {
    try {
      const parsed = JSON.parse(value ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async findByProfileId(profileId: string): Promise<Symptom[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName} WHERE profile_id = ? AND deleted_at IS NULL ORDER BY logged_at DESC`,
      [profileId],
    );
    return rows.map((r) => this.mapRow(r));
  }
}

export const symptomRepository = new SymptomRepository();
