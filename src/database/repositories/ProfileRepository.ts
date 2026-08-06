import { decryptField, encryptField } from '../../utils/fieldCrypto';
import type { Profile } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/** Encapsulates all SQL for the `profiles` (personas) table. */
export class ProfileRepository extends BaseRepository<Profile> {
  protected readonly tableName = 'profiles';

  protected mapDomain(row: Row): EntityColumns<Profile> {
    return {
      userId: row.user_id as string,
      name: row.name as string,
      ageNum: (row.age_num as number) ?? null,
      weight: (row.weight as number) ?? null,
      height: (row.height as number) ?? null,
      allergy: decryptField((row.allergy as string) ?? null),
      role: (row.role as string) ?? null,
      color: row.color as string,
      initial: row.initial as string,
      photo: (row.photo as string) ?? null,
      isOwner: Boolean(row.is_owner),
    };
  }

  protected toColumns(entity: EntityColumns<Profile>): Row {
    return {
      user_id: entity.userId,
      name: entity.name,
      age_num: entity.ageNum,
      weight: entity.weight,
      height: entity.height,
      allergy: encryptField(entity.allergy),
      role: entity.role,
      color: entity.color,
      initial: entity.initial,
      photo: entity.photo,
      is_owner: entity.isOwner ? 1 : 0,
    };
  }

  /** All personas of a user, owner first then oldest-created. */
  async findByUserId(userId: string): Promise<Profile[]> {
    const rows = await this.db.getAllAsync<Row>(
      `SELECT * FROM ${this.tableName}
        WHERE user_id = ? AND deleted_at IS NULL
        ORDER BY is_owner DESC, created_at ASC`,
      [userId],
    );
    return rows.map((r) => this.mapRow(r));
  }
}

export const profileRepository = new ProfileRepository();
