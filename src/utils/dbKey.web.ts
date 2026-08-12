import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import * as Crypto from 'expo-crypto';

/**
 * Web-only fallback for the device data key. Expo Secure Store has no web
 * implementation, so this preview build persists the key in `localStorage`.
 * This is DEV/PREVIEW only — the production surface is native (Android/iOS),
 * where `dbKey.ts` uses the keystore/keychain-backed Secure Store.
 */
const DB_KEY = 'dc_db_key';

export async function getOrCreateDbKey(): Promise<Uint8Array> {
  const existing = typeof window !== 'undefined' ? window.localStorage.getItem(DB_KEY) : null;
  if (existing) return hexToBytes(existing);
  const key = Crypto.getRandomBytes(32);
  if (typeof window !== 'undefined') window.localStorage.setItem(DB_KEY, bytesToHex(key));
  return key;
}
