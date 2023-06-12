import Router from 'koa-router';
import searchController from '../controllers/searchController';
import { requireAuth } from '../middleware/authMiddleware';

const search = new Router();
search.use(requireAuth);
search.get('/search', async (ctx) => {
  try {
    const { q, p } = ctx.request.query;
    const page = p ? parseInt(p) : undefined;
    ctx.body = await searchController.searchByWords(q, page);
  } catch (e) {
    console.error(e);
  }
});

export default search;