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
      ctx.attachment(safeDownloadName(bookData.length ? bookData[0].Title : null, bookId));
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
    const token = await jwt.sign({ bookId }, config.jwtSecret, { expiresIn: '5m' });
    const downloadUrl = `/books/download?token=${token}`;

    ctx.body = { downloadUrl };
  } catch (e) {
    console.error(e);
  }
});

export default books;

/**
 * DB titles go into Content-Disposition — strip anything that could break
 * the header (quotes, CRLF, non-ASCII). Falls back to book-<id>.fb2.
 */
function safeDownloadName(title: string | null, bookId: string): string {
  const cleaned = (title || '').replace(/[^A-Za-z0-9 _.-]+/g, '').trim().slice(0, 80);
  const base = cleaned || `book-${bookId}`;
  return `${base}.fb2`;
}
