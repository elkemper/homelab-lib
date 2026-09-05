import { describe, it, expect, vi } from 'vitest';

vi.mock('../../db', () => ({
  search: vi.fn(),
}));

vi.mock('../../db/search', () => ({
  buildMatchQuery: vi.fn(),
}));

import * as db from '../../db';
import { buildMatchQuery } from '../../db/search';
import config from '../../config';
import { searchByWords } from '../../controllers/searchController';

describe('searchByWords', () => {
  it('page 0 passes match query, limit and offset 0', async () => {
    vi.mocked(buildMatchQuery).mockReturnValue('"test"*');
    vi.mocked(db.search).mockResolvedValue({ rows: [{ BookID: 1 } as any], total: 2 });

    const out = await searchByWords('test', 0);

    expect(buildMatchQuery).toHaveBeenCalledWith('test');
    expect(db.search).toHaveBeenCalledWith('"test"*', config.defaultPerPage, 0);
    expect(out).toEqual({ result: [{ BookID: 1 }], count: 2 });
  });

  it('page 1 uses offset = page * perPage and still returns total', async () => {
    vi.mocked(buildMatchQuery).mockReturnValue('"test"*');
    vi.mocked(db.search).mockResolvedValue({ rows: [], total: 2 });

    const out = await searchByWords('test', 1);

    expect(db.search).toHaveBeenCalledWith('"test"*', config.defaultPerPage, 1 * config.defaultPerPage);
    expect(out.count).toBe(2);
  });

  it.each([-1, NaN, 1.5])('bad page %s falls back to page 0', async (badPage) => {
    vi.mocked(buildMatchQuery).mockReturnValue('"test"*');
    vi.mocked(db.search).mockResolvedValue({ rows: [], total: 2 });

    const out = await searchByWords('test', badPage);

    expect(db.search).toHaveBeenCalledWith('"test"*', config.defaultPerPage, 0);
    expect(out.count).toBe(2);
  });

  it('empty query returns empty result without hitting db', async () => {
    vi.mocked(buildMatchQuery).mockReturnValue(null);
    vi.mocked(db.search).mockClear();

    const out = await searchByWords('   ', 0);

    expect(db.search).not.toHaveBeenCalled();
    expect(out).toEqual({ result: [], count: 0 });
  });
});
