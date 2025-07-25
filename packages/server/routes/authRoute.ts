import Router from 'koa-router';
import { authenticateUser } from '../utils/authUtils';
import KoaLogger from 'koa-logger';
import { getUserByUsername } from '../db/users';
import User from '../models/User';
import bodyParser from 'koa-bodyparser';

const authRouter = new Router();
authRouter.post('/auth', async (ctx) => {
  try {
    const { username, password } = ctx.request.body as { username: string; password: string };
    const user: User = await getUserByUsername(username.toLowerCase());
    if (!user) {
      (ctx.status = 404), (ctx.body = { message: 'User not found.' });
      return;
    }

    const token: string = await authenticateUser(username.toLowerCase(), password);
    if (!token) {
      ctx.status = 401;
      return;
    }
    ctx.status = 200;
    ctx.body = { token };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error };
  }
});

export default authRouter;
