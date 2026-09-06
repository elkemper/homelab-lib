import { useState } from 'preact/hooks';
import { useAuth } from '../AuthContext';
import { ApiError, getDownloadUrl, type Book } from '../lib/api';

export default function BookCard({ book }: { book: Book }) {
  const { token, logout, t } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const url = await getDownloadUrl(token, book.BookID);
      window.location.href = url;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        logout();
        window.location.hash = '#/login';
        return;
      }
      // 404 comes from the mint pre-check: book is not on disk, so no
      // navigation ever started — show it inline, stay on the page.
      setError(e instanceof ApiError && e.status === 404 ? t('book.notInArchive') : t('book.downloadError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="book">
      <div className="book-main">
        <div className="book-title">{book.Title}</div>
        <div className="book-meta">{book.authors}</div>
        <div className="book-meta book-meta-dim">
          {[book.SeriesTitle ? t('book.series') + ': ' + book.SeriesTitle + (book.SeqNumber ? ' #' + book.SeqNumber : '') : null, book.Lang]
            .filter(Boolean)
            .join(' · ')}
        </div>
        {error && (
          <div className="book-error" role="alert">
            {error}
          </div>
        )}
      </div>
      <div className="book-side">
        <button className="btn" onClick={download} disabled={busy}>
          {busy ? t('book.downloading') : t('book.download')}
        </button>
      </div>
    </li>
  );
}
