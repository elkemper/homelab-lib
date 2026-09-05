import { describe, expect, it } from 'vitest';
import { translate } from './i18n';

describe('i18n', () => {
  it('translates ru and en', () => {
    expect(translate('ru', 'search.button')).toBe('Найти');
    expect(translate('en', 'search.button')).toBe('Search');
  });
  it('interpolates vars', () => {
    expect(translate('ru', 'search.found', { count: 5 })).toBe('Найдено: 5');
    expect(translate('en', 'search.pageOf', { page: 2, pages: 10 })).toBe('Page 2 of 10');
  });
});
