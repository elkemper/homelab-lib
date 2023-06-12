import booksController from '../controllers/booksController';
import Router from 'koa-router';
import { requireAuth } from '../middleware/authMiddleware';

const books = new Router();

books.use(requireAuth); // Apply authentication middleware to all routes in this router

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
    const bookstream = await booksController.getBookStream(ctx.params['id']);
    const bookData = await booksController.getBookData(ctx.params['id']);
    ctx.body = bookstream;
    ctx.type = 'text/plain';
    ctx.attachment(`${bookData[0].Title}.fb2`);
  } catch (e) {
    console.error(e);
  }
});

export default books;