import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
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

  // Token is verified above, safe to read. Share user with next guards.
  const decoded = jwt.decode(token) as { username: string } | null;
  if (!decoded?.username) {
    ctx.status = 401;
    ctx.body = 'Invalid token';
    return;
  }
  ctx.state.username = decoded.username;

  await next();
};
