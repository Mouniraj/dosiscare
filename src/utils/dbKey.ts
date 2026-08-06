import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DB_KEY = 'dc_db_key';

/**
 * Returns the device's 256‑bit data key, creating and persisting it in Secure
 * Store on first run. The key never leaves the secure enclave/keystore‑backed
 * storage and is used to encrypt sensitive health fields at rest.
 */
export async function getOrCreateDbKey(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(DB_KEY);
  if (existing) return hexToBytes(existing);
  const key = Crypto.getRandomBytes(32);
  await SecureStore.setItemAsync(DB_KEY, bytesToHex(key));
  return key;
}
