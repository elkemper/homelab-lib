import { useState } from 'preact/hooks';
import { useAuth } from '../AuthContext';
import { pageWindow, totalPages, clampPage } from '../lib/pagination';

interface Props {
  page: number;
  count: number;
  onGo: (p: number) => void;
}

export default function Pagination({ page, count, onGo }: Props) {
  const { t } = useAuth();
  const [jump, setJump] = useState('');
  const pages = totalPages(count);
  if (pages <= 1) return null;
  const cur = clampPage(page, pages);
  const window_ = pageWindow(cur, pages);

  const submitJump = (e: Event) => {
    e.preventDefault();
    if (!jump.trim()) return;
    const n1 = Number(jump) - 1; // user-facing is 1-based
    if (!Number.isInteger(n1)) return;
    onGo(clampPage(n1, pages));
    setJump('');
  };

  return (
    <nav className="pager" aria-label="pagination">
      <button className="btn btn-ghost" disabled={cur <= 0} onClick={() => onGo(cur - 1)}>
        ← {t('pagination.prev')}
      </button>
      <span className="pager-nums" role="list">
        {window_.map((p, i) =>
          p === '…' ? (
            <span key={'e' + i} className="pager-ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              role="listitem"
              aria-current={p === cur ? 'page' : undefined}
              aria-label={t('pagination.page') + ' ' + (p + 1)}
              className={p === cur ? 'pager-num is-active' : 'pager-num'}
              onClick={() => onGo(p)}
            >
              {p + 1}
            </button>
          )
        )}
      </span>
      <button className="btn btn-ghost" disabled={cur >= pages - 1} onClick={() => onGo(cur + 1)}>
        {t('pagination.next')} →
      </button>
      <form className="pager-jump" onSubmit={submitJump}>
        <label className="visually-hidden" htmlFor="pager-jump-input">
          {t('pagination.page')}
        </label>
        <input
          id="pager-jump-input"
          className="input pager-jump-input"
          type="number"
          min={1}
          max={pages}
          inputMode="numeric"
          value={jump}
          onInput={(e) => setJump((e.target as HTMLInputElement).value)}
          placeholder={'1–' + pages}
        />
        <button className="btn btn-ghost" type="submit">
          {t('pagination.go')}
        </button>
      </form>
    </nav>
  );
}
