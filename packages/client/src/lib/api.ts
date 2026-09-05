import config from '../config';

export interface Book {
  BookID: number;
  Title: string;
  authors: string;
  SeriesTitle: string | null;
  SeqNumber: number | null;
  Lang: string;
}

export interface SearchResponse {
  result: Book[];
  count: number;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
}

async function check(res: Response): Promise<Response> {
  if (res.ok) return res;
  let msg = 'HTTP ' + res.status;
  try {
    const body = await res.clone().json();
    if (body && (body.error || body.message)) msg = String(body.error || body.message);
  } catch {
    // keep default
  }
  throw new ApiError(res.status, msg);
}

export function buildSearchUrl(q: string, page: number): string {
  const params = new URLSearchParams({ q: q.trim() });
  if (page > 0) params.set('p', String(page));
  return 'search?' + params.toString();
}

export async function loginRequest(username: string, password: string): Promise<string> {
  const res = await fetch(config.apiUrl + '/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password: password.trim() }),
  });
  await check(res);
  const data = await res.json();
  return data.token as string;
}

export async function searchBooks(token: string | null, q: string, page: number): Promise<SearchResponse> {
  const safePage = Number.isInteger(page) && page >= 0 ? page : 0;
  const res = await fetch(config.apiUrl + '/' + buildSearchUrl(q, safePage), {
    headers: authHeaders(token),
  });
  await check(res);
  return (await res.json()) as SearchResponse;
}

export async function getDownloadUrl(token: string | null, bookId: number): Promise<string> {
  const res = await fetch(config.apiUrl + '/books/' + bookId + '/download', {
    headers: authHeaders(token),
  });
  await check(res);
  const data = await res.json();
  return config.apiUrl + data.downloadUrl;
}

export interface ManagedUser {
  id: number;
  username: string;
}

export async function listUsers(token: string | null): Promise<ManagedUser[]> {
  const res = await fetch(config.apiUrl + '/users', { headers: authHeaders(token) });
  await check(res);
  return (await res.json()) as ManagedUser[];
}

export async function createUserReq(
  token: string | null,
  username: string,
  password: string
): Promise<{ id: number }> {
  const res = await fetch(config.apiUrl + '/users', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ username: username.trim(), password: password.trim() }),
  });
  await check(res);
  return (await res.json()) as { id: number };
}

export async function deleteUserReq(token: string | null, id: number): Promise<void> {
  const res = await fetch(config.apiUrl + '/users/' + id, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (res.status === 204) return;
  await check(res);
}
