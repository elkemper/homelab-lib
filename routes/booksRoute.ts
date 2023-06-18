import booksController from '../controllers/booksController';
import Router from 'koa-router';
import { requireAuth } from '../middleware/authMiddleware';
import * as jwt from 'jsonwebtoken';
import config from '../config';

const books = new Router();

books.get('/books/download', async (ctx) => {
  try {
    const { token } = ctx.request.query as { token: string };
    console.log(`tokern ${token}`);
    const decoded = (await jwt.verify(token, config.jwtSecret)) as { bookId: string };
    const bookId = decoded.bookId;

    const bookstream = await booksController.getBookStream(bookId);
    const bookData = await booksController.getBookData(bookId);
    ctx.body = bookstream;
    ctx.type = 'text/plain';
    ctx.attachment(`${bookData[0].Title}.fb2`);
  } catch (e) {
    console.error(e);
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
    const downloadUrl = `${ctx.origin}${config.backendUnderSlashApi ? '/api': ''}/books/download?token=${token}`; 

    ctx.body = { downloadUrl };
  } catch (e) {
    console.error(e);
  }
});

export default books;
