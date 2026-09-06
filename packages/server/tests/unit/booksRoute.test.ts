import { describe, it, expect } from 'vitest';
import { safeDownloadName, setDownloadDisposition } from '../../routes/booksRoute';

describe('safeDownloadName', () => {
  it('keeps Cyrillic titles', () => {
    expect(safeDownloadName('Случай на Пенгалане', '203902')).toBe('Случай на Пенгалане.fb2');
  });

  it('strips header-breakers (quotes, CRLF, controls)', () => {
    expect(safeDownloadName('a"b\r\nc\x00d', '1')).toBe('abcd.fb2');
  });

  it('collapses whitespace and caps length', () => {
    expect(safeDownloadName('  a   b  ', '1')).toBe('a b.fb2');
    expect(safeDownloadName('x'.repeat(200), '1').length).toBeLessThanOrEqual(104);
  });

  it('falls back to book-<id> when nothing remains', () => {
    expect(safeDownloadName(null, '42')).toBe('book-42.fb2');
    expect(safeDownloadName('   ', '42')).toBe('book-42.fb2');
    expect(safeDownloadName('"\r\n', '42')).toBe('book-42.fb2');
  });
});

describe('setDownloadDisposition', () => {
  it('sets ascii filename + utf-8 filename*', () => {
    const headers: Record<string, string> = {};
    setDownloadDisposition({ set: (f, v) => (headers[f] = v) }, 'Случай на Пенгалане', '203902');
    const cd = headers['Content-Disposition'];
    expect(cd).toContain('filename="book-203902.fb2"');
    expect(cd).toContain("filename*=UTF-8''");
    expect(decodeURIComponent(cd.split("filename*=UTF-8''")[1])).toBe('Случай на Пенгалане.fb2');
  });

  it('sanitizes the bookId in the ascii fallback', () => {
    const headers: Record<string, string> = {};
    setDownloadDisposition({ set: (f, v) => (headers[f] = v) }, 'T', '1/2 съоб');
    expect(headers['Content-Disposition']).toContain('filename="book-12.fb2"');
  });
});
