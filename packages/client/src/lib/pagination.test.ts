import { describe, expect, it } from 'vitest';
import { clampPage, pageWindow, parsePageParam, totalPages } from '../lib/pagination';

describe('totalPages', () => {
  it('computes pages for 50/page default', () => {
    expect(totalPages(0)).toBe(0);
    expect(totalPages(1)).toBe(1);
    expect(totalPages(50)).toBe(1);
    expect(totalPages(51)).toBe(2);
    expect(totalPages(6000)).toBe(120);
  });
});

describe('clampPage', () => {
  it('rejects NaN, negatives, floats, strings', () => {
    expect(clampPage(Number('abc'), 10)).toBe(0);
    expect(clampPage(-5, 10)).toBe(0);
    expect(clampPage(1.5, 10)).toBe(0);
    expect(clampPage('3', 10)).toBe(3);
  });
  it('clamps to last page', () => {
    expect(clampPage(99, 5)).toBe(4);
    expect(clampPage(4, 5)).toBe(4);
  });
});

describe('pageWindow', () => {
  it('lists all when few pages', () => {
    expect(pageWindow(0, 3)).toEqual([0, 1, 2]);
  });
  it('uses ellipsis on large sets', () => {
    expect(pageWindow(4, 120)).toEqual([0, '…', 2, 3, 4, 5, 6, '…', 119]);
    expect(pageWindow(0, 120)).toEqual([0, 1, 2, '…', 119]);
  });
});

describe('parsePageParam', () => {
  it('parses hash p param safely', () => {
    expect(parsePageParam(null)).toBe(0);
    expect(parsePageParam('')).toBe(0);
    expect(parsePageParam('abc')).toBe(0);
    expect(parsePageParam('-2')).toBe(0);
    expect(parsePageParam('4')).toBe(4);
  });
});
