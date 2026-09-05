import Router from 'koa-router';
import { authenticateUser } from '../utils/authUtils';
import KoaLogger from 'koa-logger';
import { getUserByUsername } from '../db/users';
import User from '../models/User';
import bodyParser from 'koa-bodyparser';

const authRouter = new Router();
authRouter.post('/auth', async (ctx) => {
  try {
    const { username, password } = ctx.request.body as { username: unknown; password: unknown };
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      ctx.status = 400;
      ctx.body = { message: 'Username and password are required.' };
      return;
    }
    const user: User = await getUserByUsername(username.toLowerCase());
    // Same generic 401 whether the user is missing or the password is wrong:
    // distinct 404/401 would let attackers enumerate usernames.
    if (!user) {
      ctx.status = 401;
      ctx.body = { message: 'Invalid credentials.' };
      return;
    }

    const token: string = await authenticateUser(username.toLowerCase(), password);
    if (!token) {
      ctx.status = 401;
      ctx.body = { message: 'Invalid credentials.' };
      return;
    }
    ctx.status = 200;
    ctx.body = { token };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { message: 'Internal error' };
  }
});

export default authRouter;
