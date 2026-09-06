import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../db', () => ({
  getBook: vi.fn(),
  getBookData: vi.fn(),
}));

vi.mock('../../utils/zipUtils', () => ({
  default: vi.fn(),
  hasEntry: vi.fn(),
}));

vi.mock('../../config', () => ({
  default: { archivePath: 'tests/arch' },
}));

import path from 'path';
import * as db from '../../db';
import getFile, { hasEntry } from '../../utils/zipUtils';
import booksController from '../../controllers/booksController';

beforeEach(() => {
  vi.clearAllMocks();
  // getBookStream logs its inputs (app debug output); silence the expected noise.
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
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

describe('canDownload', () => {
  it('ok when row, zip and entry are present', async () => {
    vi.mocked(db.getBook).mockResolvedValue({ Folder: 'a.zip', FileName: 'book', Ext: '.fb2' } as any);
    vi.mocked(hasEntry).mockResolvedValue(true);

    expect(await booksController.canDownload('42')).toBe('ok');
  });

  it('no_book when row is missing', async () => {
    vi.mocked(db.getBook).mockResolvedValue(undefined as any);

    expect(await booksController.canDownload('42')).toBe('no_book');
  });

  it('no_zip when archive is missing', async () => {
    vi.mocked(db.getBook).mockResolvedValue({ Folder: 'nope.zip', FileName: 'book', Ext: '.fb2' } as any);

    expect(await booksController.canDownload('42')).toBe('no_zip');
  });

  it('no_zip when Folder escapes the archive dir', async () => {
    vi.mocked(db.getBook).mockResolvedValue({ Folder: '../evil.zip', FileName: 'book', Ext: '.fb2' } as any);

    expect(await booksController.canDownload('42')).toBe('no_zip');
  });

  it('no_entry when file is not inside the zip', async () => {
    vi.mocked(db.getBook).mockResolvedValue({ Folder: 'a.zip', FileName: 'missing', Ext: '.fb2' } as any);
    vi.mocked(hasEntry).mockResolvedValue(false);

    expect(await booksController.canDownload('42')).toBe('no_entry');
  });
});

describe('getBookData', () => {
  it('passes through db data', async () => {
    const data = [{ Title: 'T' }];
    vi.mocked(db.getBookData).mockResolvedValue(data as any);

    expect(await booksController.getBookData('42')).toEqual(data);
  });
});
