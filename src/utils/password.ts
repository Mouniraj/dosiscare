import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import * as Crypto from 'expo-crypto';

/**
 * Local password hashing for the Offline‑First auth. Uses PBKDF2‑HMAC‑SHA256
 * (a slow KDF) so a leaked hash resists brute force far better than a bare hash.
 * Stored format: `pbkdf2$<iterations>$<saltHex>$<hashHex>`. Legacy `salt:hash`
 * (SHA‑256) values still verify, so old accounts keep working. When a backend
 * exists, authentication moves server‑side and this remains a local fallback.
 */

const ITERATIONS = 100_000;
const KEY_LEN = 32;
const SALT_BYTES = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = Crypto.getRandomBytes(SALT_BYTES);
  const dk = pbkdf2(sha256, utf8ToBytes(password), salt, { c: ITERATIONS, dkLen: KEY_LEN });
  return `pbkdf2$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(dk)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith('pbkdf2$')) {
    const [, iterStr, saltHex, hashHex] = stored.split('$');
    const iterations = Number(iterStr);
    if (!saltHex || !hashHex || Number.isNaN(iterations)) return false;
    const dk = pbkdf2(sha256, utf8ToBytes(password), hexToBytes(saltHex), {
      c: iterations,
      dkLen: hexToBytes(hashHex).length,
    });
    return timingSafeEqual(bytesToHex(dk), hashHex);
  }

  // Legacy SHA‑256 `salt:hash` accounts.
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
  return timingSafeEqual(candidate, hash);
}

/** Length-independent, constant-time comparison to avoid timing side-channels. */
function timingSafeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}
