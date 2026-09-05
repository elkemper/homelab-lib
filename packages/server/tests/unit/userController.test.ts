import { describe, it, expect, vi } from 'vitest';

vi.mock('../../db', () => ({
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  getUsers: vi.fn(),
}));

vi.mock('../../utils/authUtils', () => ({
  hashPassword: vi.fn(),
}));

import * as db from '../../db';
import { hashPassword } from '../../utils/authUtils';
import { createUser, deleteUser, getUsersList } from '../../controllers/userController';

describe('createUser', () => {
  it('lowercases username and hashes password', async () => {
    vi.mocked(hashPassword).mockResolvedValue('hashed');
    vi.mocked(db.createUser).mockResolvedValue({ id: 1 } as any);

    await createUser({ username: 'TestUser', password: 'secret12' });

    expect(hashPassword).toHaveBeenCalledWith('secret12');
    expect(db.createUser).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'hashed',
    });
  });

  it('rejects short passwords and ignores client-supplied id', async () => {
    vi.mocked(hashPassword).mockResolvedValue('hashed');
    await expect(createUser({ username: 'bob', password: 'short' })).rejects.toThrow();
    expect(db.createUser).not.toHaveBeenCalledWith(expect.objectContaining({ username: 'bob' }));
    await createUser({ username: 'bob', password: 'longenough1', id: 0 } as any);
    expect(db.createUser).toHaveBeenCalledWith({
      username: 'bob',
      password: 'hashed',
    });
  });
});

describe('deleteUser', () => {
  it('passes user id to db', async () => {
    vi.mocked(db.deleteUser).mockResolvedValue(true as any);

    await deleteUser(7);

    expect(db.deleteUser).toHaveBeenCalledWith(7);
  });
});

describe('getUsersList', () => {
  it('returns users from db', async () => {
    const users = [{ id: 1, username: 'bob' }];
    vi.mocked(db.getUsers).mockResolvedValue(users as any);

    expect(await getUsersList()).toEqual(users);
  });
});
