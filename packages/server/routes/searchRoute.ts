import Router from 'koa-router';
import * as searchController from '../controllers/searchController';
import { requireAuth } from '../middleware/authMiddleware';

const search = new Router();
search.use(requireAuth);
search.get('/search', async (ctx) => {
  try {
    const { q, p } = ctx.request.query as { q: string; p: string };
    if (!q || q.trim() === '') {
      ctx.status = 400;
      ctx.body = { error: 'Empty search query' };
      return;
    }
    const page = p ? parseInt(p) : undefined;
    ctx.body = await searchController.searchByWords(q, page);
  } catch (e) {
    console.error(e);
    ctx.status = 400;
    ctx.body = { error: 'Bad search query' };
  }
});

export default search;
