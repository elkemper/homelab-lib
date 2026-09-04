import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../db', () => ({
  getUserByUsername: vi.fn(),
  getUserById: vi.fn(),
  getUserIdBySessionToken: vi.fn(),
  saveSessionToken: vi.fn(),
  deleteSessionToken: vi.fn(),
}));

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as db from '../../db';
import config from '../../config';
import {
  generateToken,
  hashPassword,
  authenticateUser,
  verifySessionToken,
  isAdmin,
} from '../../utils/authUtils';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('generateToken', () => {
  it('makes a token with the username inside', () => {
    const token = generateToken('bob');

    const decoded = jwt.verify(token, config.jwtSecret) as { username: string };
    expect(decoded.username).toBe('bob');
  });
});

describe('hashPassword', () => {
  it('hashes and checks with bcrypt', async () => {
    const hashed = await hashPassword('secret');

    expect(hashed).not.toBe('secret');
    expect(await bcrypt.compare('secret', hashed)).toBe(true);
  });
});

describe('isAdmin', () => {
  it('true for user id 0', async () => {
    vi.mocked(db.getUserByUsername).mockResolvedValue({ id: 0, username: 'root' } as any);

    expect(await isAdmin('root')).toBe(true);
  });

  it('false for normal user and for no user', async () => {
    vi.mocked(db.getUserByUsername).mockResolvedValue({ id: 1, username: 'bob' } as any);
    expect(await isAdmin('bob')).toBe(false);

    vi.mocked(db.getUserByUsername).mockResolvedValue(undefined as any);
    expect(await isAdmin('ghost')).toBeFalsy();
  });
});

describe('authenticateUser', () => {
  it('returns token and saves session for good password', async () => {
    const hashed = await hashPassword('pw');
    vi.mocked(db.getUserByUsername).mockResolvedValue({ id: 1, username: 'bob', password: hashed } as any);
    vi.mocked(db.saveSessionToken).mockResolvedValue(undefined as any);

    const token = await authenticateUser('bob', 'pw');

    expect(typeof token).toBe('string');
    expect(db.saveSessionToken).toHaveBeenCalledOnce();
    const [userId, savedToken, exp] = vi.mocked(db.saveSessionToken).mock.calls[0];
    expect(userId).toBe(1);
    expect(savedToken).toBe(token);
    expect(typeof exp).toBe('number');
  });

  it('returns null for bad password or no user', async () => {
    const hashed = await hashPassword('pw');
    vi.mocked(db.getUserByUsername).mockResolvedValue({ id: 1, username: 'bob', password: hashed } as any);
    expect(await authenticateUser('bob', 'wrong')).toBeNull();

    vi.mocked(db.getUserByUsername).mockResolvedValue(undefined as any);
    expect(await authenticateUser('ghost', 'pw')).toBeNull();
  });
});

describe('verifySessionToken', () => {
  it('true for good token stored in db', async () => {
    const token = generateToken('bob');
    vi.mocked(db.getUserIdBySessionToken).mockResolvedValue(1 as any);
    vi.mocked(db.getUserById).mockResolvedValue({ id: 1, username: 'bob' } as any);

    expect(await verifySessionToken(token)).toBe(true);
  });

  it('false for garbage token', async () => {
    expect(await verifySessionToken('not-a-token')).toBe(false);
  });

  it('false and deletes session for expired token', async () => {
    const expired = jwt.sign(
      { username: 'bob', exp: Math.floor(Date.now() / 1000) - 10 },
      config.jwtSecret
    );
    vi.mocked(db.getUserIdBySessionToken).mockResolvedValue(1 as any);
    vi.mocked(db.getUserById).mockResolvedValue({ id: 1, username: 'bob' } as any);

    expect(await verifySessionToken(expired)).toBe(false);
    expect(db.deleteSessionToken).toHaveBeenCalledWith(expired);
  });

  it('false when token user does not match db user', async () => {
    const token = generateToken('bob');
    vi.mocked(db.getUserIdBySessionToken).mockResolvedValue(1 as any);
    vi.mocked(db.getUserById).mockResolvedValue({ id: 1, username: 'alice' } as any);

    expect(await verifySessionToken(token)).toBe(false);
  });
});
