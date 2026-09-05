import { beforeAll, describe, expect, it } from 'vitest';
import { api, loginAsAdmin } from './helpers';

interface SearchRow {
  BookID: number;
  Title: string;
  Lang: string;
  authors: string;
  SeriesTitle: string | null;
  SeqNumber: number | null;
}

let token: string;
async function search(q: string, p = 0): Promise<{ result: SearchRow[]; count: number }> {
  const res = await api(`/api/search?q=${encodeURIComponent(q)}&p=${p}`, token);
  expect(res.status).toBe(200);
  return (await res.json()) as { result: SearchRow[]; count: number };
}

describe('search', () => {
  beforeAll(async () => {
    token = await loginAsAdmin();
  });

  it('finds a book by title with series info', async () => {
    const { result, count } = await search('chronicles');
    expect(count).toBe(1);
    expect(result).toHaveLength(1);
    expect(result[0].Title).toBe('The E2E Test Chronicles');
    expect(result[0].SeriesTitle).toBe('E2E Saga');
    expect(result[0].SeqNumber).toBe(1);
  });

  it('groups multiple authors into one row', async () => {
    const { result, count } = await search('chronicles');
    expect(count).toBe(1);
    expect(result[0].authors).toContain('Chronicle John');
    expect(result[0].authors).toContain('Doe Jane');
  });

  it('excludes deleted books', async () => {
    const { count } = await search('zzzqx');
    expect(count).toBe(0);
  });

  it('ranks title match above author match', async () => {
    const { result, count } = await search('sunstone');
    expect(count).toBe(2);
    expect(result[0].Title).toBe('Sunstone Atlas');
  });

  it('paginates with a stable total', async () => {
    const first = await search('pagination probe', 0);
    expect(first.count).toBe(53);
    expect(first.result).toHaveLength(50);
    const second = await search('pagination probe', 1);
    expect(second.count).toBe(53);
    expect(second.result).toHaveLength(3);
  });

  it('empty query is 400', async () => {
    const res = await api('/api/search?q=', token);
    expect(res.status).toBe(400);
  });
});
