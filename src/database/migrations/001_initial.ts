import { SYNC_COLUMNS_SQL } from '../../types/sync';
import type { Migration } from './types';

/**
 * Initial schema. Every domain table carries the shared sync columns so the
 * SyncService can reconcile with a backend later. Deletes are soft (deleted_at).
 */
export const migration001: Migration = {
  version: 1,
  name: 'initial_schema',
  up: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      age_num INTEGER,
      weight REAL,
      height REAL,
      allergy TEXT,
      role TEXT,
      color TEXT NOT NULL,
      initial TEXT NOT NULL,
      photo TEXT,
      is_owner INTEGER NOT NULL DEFAULT 0,
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      animal_type TEXT NOT NULL,
      breed TEXT,
      age TEXT,
      age_unit TEXT NOT NULL DEFAULT 'y',
      weight REAL,
      color TEXT NOT NULL,
      initial TEXT NOT NULL,
      photo TEXT,
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY NOT NULL,
      owner_type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      form TEXT NOT NULL,
      dose TEXT NOT NULL,
      interval_hours INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      treatment_kind TEXT NOT NULL,
      start_date TEXT NOT NULL,
      icon TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'ok',
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      doctor TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      remind_day INTEGER NOT NULL DEFAULT 0,
      remind_hour INTEGER NOT NULL DEFAULT 0,
      remind_at INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS symptoms (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      logged_at INTEGER NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      custom TEXT NOT NULL DEFAULT '[]',
      temperature REAL,
      temp_unit TEXT NOT NULL DEFAULT 'C',
      note TEXT,
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS person_vaccines (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      reminder TEXT NOT NULL DEFAULT 'once',
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS pet_vaccines (
      id TEXT PRIMARY KEY NOT NULL,
      pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      alarm INTEGER NOT NULL DEFAULT 0,
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS vet_appointments (
      id TEXT PRIMARY KEY NOT NULL,
      pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      vet TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      description TEXT,
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS tracking_records (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      recorded_at INTEGER NOT NULL,
      reminder TEXT NOT NULL DEFAULT 'once',
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS dose_history (
      id TEXT PRIMARY KEY NOT NULL,
      medication_id TEXT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL,
      scheduled_at INTEGER NOT NULL,
      actual_at INTEGER,
      caregiver_id TEXT,
      status TEXT NOT NULL,
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS caregivers (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT,
      tag TEXT NOT NULL DEFAULT 'active',
      invited_email TEXT,
      ${SYNC_COLUMNS_SQL}
    );

    CREATE TABLE IF NOT EXISTS profile_sounds (
      profile_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      sound TEXT NOT NULL DEFAULT 'bell'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_pets_user ON pets(user_id);
    CREATE INDEX IF NOT EXISTS idx_meds_owner ON medications(owner_type, owner_id);
    CREATE INDEX IF NOT EXISTS idx_appts_profile ON appointments(profile_id);
    CREATE INDEX IF NOT EXISTS idx_symptoms_profile ON symptoms(profile_id);
    CREATE INDEX IF NOT EXISTS idx_person_vaccines_profile ON person_vaccines(profile_id);
    CREATE INDEX IF NOT EXISTS idx_pet_vaccines_pet ON pet_vaccines(pet_id);
    CREATE INDEX IF NOT EXISTS idx_vet_appts_pet ON vet_appointments(pet_id);
    CREATE INDEX IF NOT EXISTS idx_tracking_profile ON tracking_records(profile_id);
    CREATE INDEX IF NOT EXISTS idx_dose_history_med ON dose_history(medication_id);
    CREATE INDEX IF NOT EXISTS idx_caregivers_profile ON caregivers(profile_id);

    CREATE INDEX IF NOT EXISTS idx_sync_users ON users(sync_status);
    CREATE INDEX IF NOT EXISTS idx_sync_profiles ON profiles(sync_status);
    CREATE INDEX IF NOT EXISTS idx_sync_meds ON medications(sync_status);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);
  `,
};
