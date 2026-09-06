import booksController from '../controllers/booksController';
import Router from 'koa-router';
import { requireAuth } from '../middleware/authMiddleware';
import * as jwt from 'jsonwebtoken';
import config from '../config';

const books = new Router();

books.get('/books/download', async (ctx) => {
  try {
    const { token } = ctx.request.query as { token: string };
    let decoded: { bookId: string };
    try {
      decoded = (await jwt.verify(token, config.jwtSecret)) as { bookId: string };
    } catch {
      ctx.status = 401;
      ctx.body = 'Invalid or expired download token';
      return;
    }
    const bookId = decoded.bookId;

    let bookstream: unknown;
    try {
      bookstream = await booksController.getBookStream(bookId);
    } catch (e) {
      console.error(e);
      ctx.status = 500;
      ctx.body = 'Failed to read book archive';
      return;
    }
    if (bookstream === null) {
      ctx.status = 404;
      ctx.body = 'Not Found';
    } else {
      const bookData = await booksController.getBookData(bookId);
      ctx.body = bookstream;
      ctx.type = 'application/xml';
      setDownloadDisposition(ctx, bookData.length ? bookData[0].Title : null, bookId);
    }
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = 'Internal error';
  }
});

books.use(requireAuth); // Apply authentication middleware to only rotes that can process it

books.get('/books/:id', async (ctx) => {
  try {
    const bookData = await booksController.getBookData(ctx.params['id']);
    if (bookData.length !== 0) {
      ctx.body = bookData;
    } else {
      ctx.status = 404;
      ctx.body = 'Not Found';
    }
  } catch (e) {
    console.error(e);
  }
});

books.get('/books/:id/download', async (ctx) => {
  try {
    const bookId = ctx.params['id'];
    // Pre-flight: never mint a token for a book that isn't on disk —
    // the client shows an inline error instead of landing on a blank 404.
    const availability = await booksController.canDownload(bookId);
    if (availability !== 'ok') {
      ctx.status = 404;
      ctx.body = { message: 'Book is not available in the local archive', reason: availability };
      return;
    }
    const token = await jwt.sign({ bookId }, config.jwtSecret, { expiresIn: '5m' });
    const downloadUrl = `/books/download?token=${token}`;

    ctx.body = { downloadUrl };
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = { message: 'Internal error' };
  }
});

export default books;

/**
 * DB titles go into Content-Disposition. Unicode letters are kept
 * (Cyrillic book names must survive); only header-breakers are stripped:
 * quotes, backslashes, CR/LF and other control chars. Falls back to
 * book-<id>.fb2 when nothing usable remains.
 */
export function safeDownloadName(title: string | null, bookId: string): string {
  const cleaned = (title || '')
    // eslint-disable-next-line no-control-regex
    .replace(/["\\\r\n\x00-\x1f\x7f]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  const base = cleaned || `book-${bookId}`;
  return `${base}.fb2`;
}

/**
 * RFC 5987: `filename` (plain ASCII, for ancient clients incl. e-ink
 * readers) + `filename*` (UTF-8, for modern browsers). Either survives
 * on its own, so Cyrillic names download correctly everywhere.
 */
export function setDownloadDisposition(
  ctx: { set: (field: string, value: string) => void },
  title: string | null,
  bookId: string
): void {
  const asciiFallback = `book-${String(bookId).replace(/[^A-Za-z0-9_-]/g, '') || 'book'}.fb2`;
  const fullName = safeDownloadName(title, bookId);
  ctx.set(
    'Content-Disposition',
    `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fullName)}`
  );
}
