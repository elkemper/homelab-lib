import { describe, expect, it } from 'vitest';
import { parseHash, buildHash } from './router';

describe('hash router', () => {
  it('parses search with q and p', () => {
    expect(parseHash('#/search?q=%D0%9E%D1%80%D1%83%D1%8D%D0%BB%D0%BB&p=2')).toEqual({
      name: 'search',
      query: 'Оруэлл',
      page: 2,
      bookId: null,
    });
  });
  it('resets bad page to 0', () => {
    expect(parseHash('#/search?q=x&p=abc').page).toBe(0);
    expect(parseHash('#/search?q=x&p=-5').page).toBe(0);
  });
  it('round-trips', () => {
    const r = { name: 'search' as const, query: 'harbor', page: 3, bookId: null };
    expect(parseHash(buildHash(r))).toEqual(r);
  });
  it('supports future book pages', () => {
    expect(parseHash('#/book/42')).toEqual({ name: 'book', query: '', page: 0, bookId: '42' });
  });
});
