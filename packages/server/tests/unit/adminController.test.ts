import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../db', () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock('../../utils/authUtils', () => ({
  hashPassword: vi.fn(),
}));

vi.mock('../../config', () => ({
  default: { adminUsername: 'root', adminPassword: 'pw' },
}));

import * as db from '../../db';
import { hashPassword } from '../../utils/authUtils';
import { createOrUpdateAdmin } from '../../controllers/adminController';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createOrUpdateAdmin', () => {
  it('updates admin when id 0 exists', async () => {
    vi.mocked(db.getUserById).mockResolvedValue({ id: 0, username: 'root' } as any);
    vi.mocked(hashPassword).mockResolvedValue('hashed');

    await createOrUpdateAdmin();

    expect(db.updateUser).toHaveBeenCalledWith({
      id: 0,
      username: 'root',
      password: 'hashed',
    });
    expect(db.createUser).not.toHaveBeenCalled();
  });

  it('creates admin when id 0 is missing', async () => {
    vi.mocked(db.getUserById).mockResolvedValue(undefined as any);
    vi.mocked(hashPassword).mockResolvedValue('hashed');

    await createOrUpdateAdmin();

    expect(db.createUser).toHaveBeenCalledWith({
      id: 0,
      username: 'root',
      password: 'hashed',
    });
    expect(db.updateUser).not.toHaveBeenCalled();
  });
});
