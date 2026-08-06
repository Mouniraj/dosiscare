import * as Crypto from 'expo-crypto';

import { open, seal } from './aesGcm';
import { getOrCreateDbKey } from './dbKey';

/**
 * Application‑level encryption for sensitive health fields at rest. Repositories
 * call `encryptField`/`decryptField` in their column mappers; the key is loaded
 * once at boot via `initFieldCrypto` (kept in memory) so the mappers stay sync.
 * Values are tagged `enc1:` — untagged (legacy plaintext) values pass through, so
 * existing rows keep working after the feature is enabled.
 */

const PREFIX = 'enc1:';
let key: Uint8Array | null = null;

/** Loads (or provisions) the data key. Call once during app boot. */
export async function initFieldCrypto(keyOverride?: Uint8Array): Promise<void> {
  key = keyOverride ?? (await getOrCreateDbKey());
}

function requireKey(): Uint8Array {
  if (!key) throw new Error('fieldCrypto not initialized — call initFieldCrypto() at boot.');
  return key;
}

export function encryptField(value: string | null): string | null {
  if (value === null) return null;
  const nonce = Crypto.getRandomBytes(12);
  return PREFIX + seal(requireKey(), nonce, value);
}

export function decryptField(value: string | null): string | null {
  if (value === null) return null;
  if (!value.startsWith(PREFIX)) return value; // legacy plaintext
  return open(requireKey(), value.slice(PREFIX.length));
}
