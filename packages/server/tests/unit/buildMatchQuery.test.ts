import { describe, it, expect } from 'vitest';
import { buildMatchQuery } from '../../db/search';

describe('buildMatchQuery', () => {
  it('empty input returns null', () => {
    expect(buildMatchQuery('')).toBeNull();
    expect(buildMatchQuery('   ')).toBeNull();
  });

  it('single word gets prefix search', () => {
    expect(buildMatchQuery('оруэлл')).toBe('"оруэлл"*');
  });

  it('words join with AND', () => {
    expect(buildMatchQuery('Оруэлл 1984')).toBe('"Оруэлл"* AND "1984"*');
  });

  it('short words get no prefix star', () => {
    expect(buildMatchQuery('я и')).toBe('"я" AND "и"');
  });

  it('strips FTS syntax chars so query cannot crash', () => {
    expect(buildMatchQuery('a"b*c')).toBe('"abc"*');
  });
});
