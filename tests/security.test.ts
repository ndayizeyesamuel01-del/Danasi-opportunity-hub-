import { describe, it, expect } from 'bun:test';
import crypto from 'crypto';
import { hashPassword, verifyPassword } from '../src/backend/db.ts';
import { getReliableClientIp } from '../src/backend/auth.ts';

describe('Security Architecture & Auth hardening', () => {
  it('should hash and verify passwords correctly using scrypt with random salt', () => {
    const password = 'StrongPassword!2026';
    const { hash, salt } = hashPassword(password);

    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(hash.length).toBeGreaterThan(32);

    const isValid = verifyPassword(password, hash, salt);
    expect(isValid).toBe(true);

    const isInvalid = verifyPassword('WrongPassword!2026', hash, salt);
    expect(isInvalid).toBe(false);
  });

  it('should generate secure tokens with 256 bits of entropy', () => {
    const token1 = crypto.randomBytes(32).toString('hex');
    const token2 = crypto.randomBytes(32).toString('hex');

    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64);
  });

  it('should compute deterministic SHA-256 hashes for password reset tokens', () => {
    const rawToken = '7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a';
    const hash1 = crypto.createHash('sha256').update(rawToken).digest('hex');
    const hash2 = crypto.createHash('sha256').update(rawToken).digest('hex');

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
    // Raw token must not equal the hash
    expect(hash1).not.toBe(rawToken);
  });

  it('should reliably extract client IP with trusted proxies', () => {
    // 1. x-real-ip
    const reqWithRealIp: any = {
      headers: {
        'x-real-ip': '197.243.10.45'
      },
      socket: { remoteAddress: '10.0.0.1' }
    };
    expect(getReliableClientIp(reqWithRealIp)).toBe('197.243.10.45');

    // 2. x-forwarded-for with proxy chain
    const reqWithForwarded: any = {
      headers: {
        'x-forwarded-for': '197.243.10.46, 10.0.0.2, 172.16.0.1'
      },
      socket: { remoteAddress: '10.0.0.1' }
    };
    expect(getReliableClientIp(reqWithForwarded)).toBe('197.243.10.46');

    // 3. Fallback to socket remoteAddress
    const reqSocketOnly: any = {
      headers: {},
      socket: { remoteAddress: '192.168.1.100' }
    };
    expect(getReliableClientIp(reqSocketOnly)).toBe('192.168.1.100');
  });
});
