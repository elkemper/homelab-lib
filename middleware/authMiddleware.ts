import { Context, Next } from 'koa';
import { verifySessionToken } from '../utils/authUtils';

export const requireAuth = async (ctx: Context, next: Next) => {
  if (!ctx.headers.authorization) {
    ctx.status = 401;
    ctx.body = 'Authorization required';
    return;
  }

  const token = ctx.headers.authorization.split(' ')[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = 'Invalid token';
    return;
  }

  const isValidToken = await verifySessionToken(token);
  if (!isValidToken) {
    ctx.status = 401;
    ctx.body = 'Invalid token';
    return;
  }

  await next();
};
