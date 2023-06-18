import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import KoaLogger from 'koa-logger';
import cors from 'koa2-cors';
import Router from 'koa-router';
import books from '../routes/booksRoute';
import search from '../routes/searchRoute';
import userRoute from '../routes/userRoute';
import config from '../config';
import authRouter from '../routes/authRoute';
import { createOrUpdateAdmin } from '../controllers/adminController';
import { deleteAllTokens, startDeleteExpiredTokens } from '../utils/authUtils';
import rateLimitMiddleware from '../middleware/rateLimitMiddleware';
import startupChecks from '../utils/startupChecks';

const app = new Koa();

const PORT: number = config.port;

app.use(rateLimitMiddleware);

app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(KoaLogger());
app.use(bodyParser());

const router = new Router();
router.get('/health', async (ctx) => {
  try {
    ctx.body = {
      success: true,
    };
  } catch (e) {
    console.error(e);
  }
});

app.use(router.routes());
app.use(books.routes());
app.use(search.routes());
app.use(authRouter.routes());
app.use(userRoute.routes());

startupChecks()

const server = app
  .listen(PORT, async () => {
    console.log(`Server listening on port: ${PORT}`);
    createOrUpdateAdmin();
    deleteAllTokens();
    startDeleteExpiredTokens();
  })
  .on('error', (e) => {
    console.log(e);
  });
