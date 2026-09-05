// Pure, tested pagination helpers. No DOM, no framework.

export const PER_PAGE = 50;

export function clampPage(p: unknown, totalPages: number): number {
  const n = typeof p === 'number' ? p : Number(p);
  if (!Number.isInteger(n) || n < 0) return 0;
  if (totalPages <= 0) return 0;
  if (n > totalPages - 1) return totalPages - 1;
  return n;
}

export function totalPages(count: number, perPage: number = PER_PAGE): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  if (!Number.isFinite(perPage) || perPage <= 0) return 0;
  return Math.ceil(count / perPage);
}

/** Compact page list: [0, '…', 3, 4, 5, '…', 19]. Zero-based. */
export function pageWindow(current: number, pages: number, radius = 2): Array<number | '…'> {
  if (pages <= 0) return [];
  const cur = clampPage(current, pages);
  if (pages <= 7) {
    const all: number[] = [];
    for (let i = 0; i < pages; i++) all.push(i);
    return all;
  }
  const out: Array<number | '…'> = [0];
  const lo = Math.max(1, cur - radius);
  const hi = Math.min(pages - 2, cur + radius);
  if (lo > 1) out.push('…');
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < pages - 2) out.push('…');
  out.push(pages - 1);
  return out;
}

export function parsePageParam(raw: string | null): number {
  if (raw == null || raw === '') return 0;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) return 0;
  return n;
}
