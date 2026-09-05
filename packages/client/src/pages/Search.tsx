import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useAuth } from '../AuthContext';
import { ApiError, searchBooks, type Book } from '../lib/api';
import { clampPage, parsePageParam, totalPages } from '../lib/pagination';
import { navigate, type Route } from '../lib/router';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';

export default function Search({ route }: { route: Route }) {
  const { token, logout, t } = useAuth();
  const [input, setInput] = useState(route.query);
  const [books, setBooks] = useState<Book[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const reqId = useRef(0);

  const page = clampPage(route.page, Math.max(1, totalPages(count)));

  const run = useCallback(
    async (q: string, p: number) => {
      const my = ++reqId.current;
      setLoading(true);
      setError('');
      try {
        const data = await searchBooks(token, q, p);
        if (reqId.current !== my) return;
        setBooks(data.result);
        setCount(data.count);
        setSearched(true);
      } catch (e) {
        if (reqId.current !== my) return;
        if (e instanceof ApiError && e.status === 401) {
          logout();
          navigate({ name: 'login', query: '', page: 0, bookId: null });
          return;
        }
        setError(t('search.error'));
      } finally {
        if (reqId.current === my) setLoading(false);
      }
    },
    [token, logout, t]
  );

  // Deep-link: hash carries q/p (back button, shared links, e-ink reload).
  // This effect is the SOLE fetcher — submit()/goPage() only navigate.
  useEffect(() => {
    setInput(route.query);
    const q = route.query.trim();
    if (q.length >= 2) {
      run(route.query, route.page);
    } else {
      // '' or 1 char: never show stale results.
      setBooks([]);
      setCount(0);
      setSearched(false);
      setError('');
    }
  }, [route.query, route.page, run]);

  const submit = (e: Event) => {
    e.preventDefault();
    const q = input.trim();
    if (q.length === 1) return;
    // Same hash → no hashchange event → fetch directly.
    if (route.query === q && route.page === 0 && q !== '') {
      run(q, 0);
      return;
    }
    navigate({ name: 'search', query: q, page: 0, bookId: null });
  };

  const goPage = (p: number) => {
    navigate({ name: 'search', query: route.query, page: p, bookId: null });
    try {
      window.scrollTo({ top: 0 });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
      <form className="searchbar" onSubmit={submit} role="search">
        <label className="visually-hidden" htmlFor="q">
          {t('search.label')}
        </label>
        <input
          id="q"
          className="input search-input"
          type="search"
          autoComplete="off"
          placeholder={t('search.placeholder')}
          value={input}
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
        />
        {input && (
          <button
            type="button"
            className="btn btn-ghost"
            aria-label={t('search.clear')}
            onClick={() => {
              setInput('');
              setBooks([]);
              setCount(0);
              setSearched(false);
              navigate({ name: 'search', query: '', page: 0, bookId: null });
            }}
          >
            ×
          </button>
        )}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {t('search.button')}
        </button>
      </form>
      <p className="hint">{t('search.hint')}</p>

      <div className="statusline" aria-live="polite">
        {loading && <span>{t('search.loading')}</span>}
        {!loading && searched && <span>{t('search.found', { count })}</span>}
        {!loading && searched && count > 0 && (
          <span> · {t('search.pageOf', { page: page + 1, pages: Math.max(1, totalPages(count)) })}</span>
        )}
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && searched && books.length === 0 && (
        <p className="empty">{route.query ? t('search.empty', { q: route.query }) : t('search.idle')}</p>
      )}
      {!loading && !searched && !error && <p className="empty">{t('search.idle')}</p>}

      <ul className="booklist">
        {books.map((b) => (
          <BookCard key={b.BookID} book={b} />
        ))}
      </ul>

      <Pagination page={page} count={count} onGo={goPage} />
    </div>
  );
}

// re-export for tests without hooks context
export { parsePageParam };
