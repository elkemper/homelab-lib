import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import KoaLogger from 'koa-logger';
import cors from 'koa2-cors';
import serve from 'koa-static';
import send from 'koa-send';
import path from 'path';
import books from './routes/booksRoute';
import search from './routes/searchRoute';
import userRoute from './routes/userRoute';
import config from './config';
import authRouter from './routes/authRoute';
import { createOrUpdateAdmin } from './controllers/adminController';
import { deleteAllTokens, startDeleteExpiredTokens } from './utils/authUtils';
import rateLimitMiddleware from './middleware/rateLimitMiddleware';
import startupChecks from './utils/startupChecks';
import health from './routes/healthRoute';

const app = new Koa();
const apiRouter = new Router({ prefix: '/api' });

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

// Authentication route (no auth middleware)
const authApiRouter = new Router({ prefix: '/api' });
authApiRouter.use(authRouter.routes());
app.use(authApiRouter.routes());
app.use(authApiRouter.allowedMethods());

// API Routes (with auth middleware where applicable)
apiRouter.use(health.routes());
apiRouter.use(books.routes());
apiRouter.use(search.routes());
apiRouter.use(userRoute.routes());

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Serve static files from the React app
const buildPath = path.resolve(__dirname, '../../../packages/client/build');
app.use(serve(buildPath));

// Catch-all for client-side routing
app.use(async (ctx, next) => {
  await send(ctx, 'index.html', { root: buildPath });
});

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
