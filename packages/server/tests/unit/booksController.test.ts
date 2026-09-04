import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../db', () => ({
  getBook: vi.fn(),
  getBookData: vi.fn(),
}));

vi.mock('../../utils/zipUtils', () => ({
  default: vi.fn(),
}));

vi.mock('../../config', () => ({
  default: { archivePath: 'tests/arch' },
}));

import path from 'path';
import * as db from '../../db';
import getFile from '../../utils/zipUtils';
import booksController from '../../controllers/booksController';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getBookStream', () => {
  it('returns file stream when archive exists', async () => {
    vi.mocked(db.getBook).mockResolvedValue({ Folder: 'a.zip', FileName: 'book', Ext: '.fb2' } as any);
    vi.mocked(getFile).mockResolvedValue('stream' as any);

    const out = await booksController.getBookStream('42');

    expect(db.getBook).toHaveBeenCalledWith('42');
    expect(getFile).toHaveBeenCalledWith(path.resolve('tests/arch', 'a.zip'), 'book.fb2');
    expect(out).toBe('stream');
  });

  it('returns null when archive is missing', async () => {
    vi.mocked(db.getBook).mockResolvedValue({ Folder: 'nope.zip', FileName: 'book', Ext: '.fb2' } as any);

    const out = await booksController.getBookStream('42');

    expect(getFile).not.toHaveBeenCalled();
    expect(out).toBeNull();
  });
});

describe('getBookData', () => {
  it('passes through db data', async () => {
    const data = [{ Title: 'T' }];
    vi.mocked(db.getBookData).mockResolvedValue(data as any);

    expect(await booksController.getBookData('42')).toEqual(data);
  });
});
