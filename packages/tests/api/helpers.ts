// Shared helpers for black-box API tests. Server URL + admin creds come from env
// so the same suite runs against compose (CI) and a local process.
export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3214';
export const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? 'e2eadmin';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'e2epass';

export async function login(username: string, password: string): Promise<Response> {
  return fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function loginAsAdmin(): Promise<string> {
  const res = await login(ADMIN_USERNAME, ADMIN_PASSWORD);
  if (res.status !== 200) throw new Error(`admin login failed: ${res.status}`);
  const body = (await res.json()) as { token: string };
  return body.token;
}

export function authed(token: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
  };
}

export async function api(path: string, token: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, authed(token, init));
}
