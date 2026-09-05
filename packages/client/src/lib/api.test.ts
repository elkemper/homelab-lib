import { describe, expect, it, vi, beforeEach } from 'vitest';
import { buildSearchUrl, searchBooks } from './api';

describe('buildSearchUrl', () => {
  it('omits p=0', () => {
    expect(buildSearchUrl('Оруэлл 1984', 0)).toBe('search?q=%D0%9E%D1%80%D1%83%D1%8D%D0%BB%D0%BB+1984');
    expect(buildSearchUrl('x', 2)).toBe('search?q=x&p=2');
  });
});

describe('searchBooks', () => {
  beforeEach(() => vi.unstubAllGlobals());
  it('sends auth header and parses response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: [], count: 0 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const data = await searchBooks('tok', 'q', 1);
    expect(data.count).toBe(0);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
  });
  it('clamps bad page to 0', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: [], count: 0 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await searchBooks('tok', 'q', Number.NaN);
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('p=');
  });
});
