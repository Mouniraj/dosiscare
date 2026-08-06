import type { User } from '../models';
import { BaseRepository, type EntityColumns, type Row } from './BaseRepository';

/** Encapsulates all SQL for the `users` (accounts) table. */
export class UserRepository extends BaseRepository<User> {
  protected readonly tableName = 'users';

  protected mapDomain(row: Row): EntityColumns<User> {
    return {
      email: row.email as string,
      name: row.name as string,
      role: (row.role as string) ?? '',
      passwordHash: row.password_hash as string,
      avatar: (row.avatar as string) ?? null,
    };
  }

  protected toColumns(entity: EntityColumns<User>): Row {
    return {
      email: entity.email,
      name: entity.name,
      role: entity.role,
      password_hash: entity.passwordHash,
      avatar: entity.avatar,
    };
  }

  /** Looks up a single account by email (case-insensitive), or null. */
  async findByEmail(email: string): Promise<User | null> {
    const matches = await this.findWhere('email', email.trim().toLowerCase());
    return matches[0] ?? null;
  }
}

export const userRepository = new UserRepository();
