import { isAdmin } from '../utils/authUtils';
import { Context, Next } from 'koa';

export const requireAdmin = async (ctx: Context, next: Next) => {
  // Auth guard must run first and fill ctx.state. Empty box = stop.
  const username: string | undefined = ctx.state?.username;
  if (!username) {
    ctx.status = 401;
    ctx.body = 'Authorization required';
    return;
  }

  if (!(await isAdmin(username))) {
    ctx.status = 403;
    ctx.body = 'Forbidden';
    return;
  }

  await next();
};
