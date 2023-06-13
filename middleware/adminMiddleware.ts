import db from '../db';
import jwt from 'jsonwebtoken'
import { isAdmin } from '../utils/authUtils';
import { Context, Next } from 'koa';

export const requireAdmin = async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization.split(' ')[1];
  const {username} = jwt.decode(token) as {
    username: string
  };

  if (! await isAdmin(username)) {
    ctx.status = 403;
    return;
  }

  await next();
};