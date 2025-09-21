import { scrypt } from 'scrypt-js';
import { Buffer } from 'buffer';

function getRandomSalt(length: number = 16): string {
  // Browser-safe random salt generator
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js
    require('crypto').randomFillSync(array);
  }
  return Buffer.from(array).toString('hex');
}

export async function hashPassword(password: string): Promise<[string, string]> {
  const salt = getRandomSalt();
  const N = 16384, r = 8, p = 1, dkLen = 64;
  const key = await scrypt(
    Buffer.from(password),
    Buffer.from(salt, 'hex'),
    N, r, p, dkLen
  );
  const hash = Buffer.from(key).toString('hex');
  return [hash, salt];
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [storedHash, storedSalt] = hash.split(':');
  const N = 16384, r = 8, p = 1, dkLen = 64;
  const key = await scrypt(
    Buffer.from(password),
    Buffer.from(storedSalt, 'hex'),
    N, r, p, dkLen
  );
  return Buffer.from(key).toString('hex') === storedHash;
}
