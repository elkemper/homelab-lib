import { beforeAll, describe, expect, it } from 'vitest';
import { api, login, loginAsAdmin } from './helpers';

let adminToken: string;

describe('users', () => {
  beforeAll(async () => {
    adminToken = await loginAsAdmin();
  });

  it('admin creates a user, user logs in, cannot touch admin routes, admin deletes', async () => {
    const created = await api('/api/users', adminToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'e2euser', password: 'e2epass123' }),
    });
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: number };
    expect(typeof id).toBe('number');

    const userLogin = await login('e2euser', 'e2epass123');
    expect(userLogin.status).toBe(200);
    const userToken = ((await userLogin.json()) as { token: string }).token;
    expect(typeof userToken).toBe('string');

    const forbidden = await api('/api/users', userToken);
    expect(forbidden.status).toBe(403);

    const listed = await api('/api/users', adminToken);
    expect(listed.status).toBe(200);
    const users = (await listed.json()) as { id: number; username: string }[];
    expect(users.some((u) => u.username === 'e2euser')).toBe(true);

    const deleted = await api(`/api/users/${id}`, adminToken, { method: 'DELETE' });
    expect(deleted.status).toBe(204);

    const gone = await login('e2euser', 'e2epass123');
    expect(gone.status).toBe(404);
  });
});
