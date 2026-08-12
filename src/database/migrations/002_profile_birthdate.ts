import type { Migration } from './types';

/**
 * Adds `birth_date` (ISO YYYY-MM-DD) to profiles so age stays derivable and does
 * not go stale. `age_num` remains for backwards compatibility with legacy rows.
 */
export const migration002: Migration = {
  version: 2,
  name: 'profile_birth_date',
  up: `
    ALTER TABLE profiles ADD COLUMN birth_date TEXT;
  `,
};
