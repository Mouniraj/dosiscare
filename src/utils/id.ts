import * as Crypto from 'expo-crypto';

/** Generates a RFC-4122 v4 UUID for use as a stable offline primary key. */
export function generateId(): string {
  return Crypto.randomUUID();
}

/** Current time as epoch milliseconds — the unit used for all timestamp columns. */
export function now(): number {
  return Date.now();
}
