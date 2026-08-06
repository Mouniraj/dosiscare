/// <reference types="jest" />
import { open, seal } from '../utils/aesGcm';

const key = new Uint8Array(32).fill(7);
const nonce = new Uint8Array(12).fill(3);

describe('aesGcm (field encryption core)', () => {
  it('round-trips plaintext', () => {
    const packed = seal(key, nonce, 'Penicilina · fiebre 38.5');
    expect(packed).not.toContain('Penicilina');
    expect(open(key, packed)).toBe('Penicilina · fiebre 38.5');
  });

  it('handles unicode and JSON payloads', () => {
    const payload = JSON.stringify(['fever', 'náuseas', 'diarréia']);
    expect(open(key, seal(key, nonce, payload))).toBe(payload);
  });

  it('rejects a tampered ciphertext (authenticated)', () => {
    const packed = seal(key, nonce, 'secret');
    const flipped = packed.slice(0, -1) + (packed.endsWith('0') ? '1' : '0');
    expect(() => open(key, flipped)).toThrow();
  });

  it('fails to decrypt with the wrong key', () => {
    const packed = seal(key, nonce, 'secret');
    const wrong = new Uint8Array(32).fill(9);
    expect(() => open(wrong, packed)).toThrow();
  });
});
