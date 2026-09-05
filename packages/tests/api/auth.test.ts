import { describe, expect, it } from 'vitest';
import { ADMIN_PASSWORD, ADMIN_USERNAME, BASE_URL, login, loginAsAdmin } from './helpers';

describe('auth', () => {
  it('admin login returns a token', async () => {
    const token = await loginAsAdmin();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('wrong password is 401', async () => {
    const res = await login(ADMIN_USERNAME, 'definitely-wrong');
    expect(res.status).toBe(401);
  });

  it('unknown user is 404', async () => {
    const res = await login('no-such-user', 'whatever');
    expect(res.status).toBe(404);
  });

  it('search without token is 401', async () => {
    const res = await fetch(`${BASE_URL}/api/search?q=test`);
    expect(res.status).toBe(401);
  });

  it('admin password is configurable, not the default', async () => {
    expect(ADMIN_PASSWORD).not.toBe('admin');
  });
});
