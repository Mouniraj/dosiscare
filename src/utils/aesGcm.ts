import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, bytesToUtf8, hexToBytes, utf8ToBytes } from '@noble/ciphers/utils.js';

/**
 * Pure AES‑256‑GCM helpers (no Expo imports, so they're unit‑testable). GCM is
 * authenticated: tampering with the ciphertext makes `open` throw.
 * Packed format: `<nonceHex>:<ciphertextHex>` (ciphertext includes the tag).
 */

export function seal(key: Uint8Array, nonce: Uint8Array, plaintext: string): string {
  const ciphertext = gcm(key, nonce).encrypt(utf8ToBytes(plaintext));
  return `${bytesToHex(nonce)}:${bytesToHex(ciphertext)}`;
}

export function open(key: Uint8Array, packed: string): string {
  const [nonceHex, ctHex] = packed.split(':');
  const plaintext = gcm(key, hexToBytes(nonceHex)).decrypt(hexToBytes(ctHex));
  return bytesToUtf8(plaintext);
}
