import { beforeAll, describe, expect, it } from 'vitest';
import { BASE_URL, api, loginAsAdmin } from './helpers';

let token: string;

describe('download', () => {
  beforeAll(async () => {
    token = await loginAsAdmin();
  });

  it('book metadata returns rows', async () => {
    const res = await api('/api/books/1', token);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { Title: string }[];
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].Title).toBe('The E2E Test Chronicles');
  });

  it('download flow serves the fake fb2 bytes', async () => {
    const metaRes = await api('/api/books/1/download', token);
    expect(metaRes.status).toBe(200);
    const { downloadUrl } = (await metaRes.json()) as { downloadUrl: string };
    expect(downloadUrl).toContain('/books/download?token=');
    // NOTE: server omits the /api prefix in downloadUrl; client prepends it.
    const res = await fetch(`${BASE_URL}/api${downloadUrl}`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('E2E-FAKE-FB2-BOOK-1');
    // RFC 5987 disposition: ascii fallback + utf-8 filename*.
    const cd = res.headers.get('content-disposition') || '';
    expect(cd).toContain('attachment');
    expect(cd).toContain("filename*=UTF-8''");
    expect(decodeURIComponent(cd.split("filename*=UTF-8''")[1])).toContain('.fb2');
  });

  it('unknown book is 404', async () => {
    const res = await api('/api/books/999999', token);
    expect(res.status).toBe(404);
  });

  it('mint for unknown book is 404 with reason (no blank-page navigation)', async () => {
    const res = await api('/api/books/999999/download', token);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { reason: string };
    expect(body.reason).toBe('no_book');
  });
});
