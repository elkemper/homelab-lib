import { describe, it, expect, vi } from 'vitest';

vi.mock('../../db', () => ({
  search: vi.fn(),
  countResults: vi.fn(),
}));

import * as db from '../../db';
import config from '../../config';
import { searchByWords } from '../../controllers/searchController';

describe('searchByWords', () => {
  it('page 0 counts results and uses offset 0', async () => {
    vi.mocked(db.countResults).mockResolvedValue(2);
    vi.mocked(db.search).mockResolvedValue([{ BookID: 1 }] as any);

    const out = await searchByWords('test', 0);

    expect(db.countResults).toHaveBeenCalledWith('test');
    expect(db.search).toHaveBeenCalledWith('test', 0);
    expect(out).toEqual({ result: [{ BookID: 1 }], count: 2 });
  });

  it('page 1 skips count and uses offset = page * perPage', async () => {
    vi.mocked(db.countResults).mockClear();
    vi.mocked(db.search).mockResolvedValue([] as any);

    const out = await searchByWords('test', 1);

    expect(db.countResults).not.toHaveBeenCalled();
    expect(db.search).toHaveBeenCalledWith('test', 1 * config.defaultPerPage);
    expect(out.count).toBe(false);
  });

  it.each([-1, NaN, 1.5])('bad page %s falls back to page 0', async (badPage) => {
    vi.mocked(db.countResults).mockResolvedValue(2);
    vi.mocked(db.search).mockResolvedValue([] as any);

    const out = await searchByWords('test', badPage);

    expect(db.search).toHaveBeenCalledWith('test', 0);
    expect(out.count).toBe(2);
  });
});
