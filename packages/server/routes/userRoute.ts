import Router from 'koa-router';
import { requireAuth } from '../middleware/authMiddleware';
import { createUser, deleteUser, getUsersList } from '../controllers/userController';
import { requireAdmin } from '../middleware/adminMiddleware';
import User from '../models/User';
import { getUserById } from '../db/users';

const userRouter = new Router();

userRouter.post('/users', requireAuth, requireAdmin, async (ctx) => {
  try {
    const id = await createUser(ctx.request.body as { username: unknown; password: unknown });
    ctx.status = 201;
    ctx.body = { id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    const badRequest = /must be|at least|at most|strings/.test(message);
    ctx.status = badRequest ? 400 : 500;
    ctx.body = badRequest ? { message } : { message: 'Internal error' };
    if (!badRequest) console.error(error);
  }
});

userRouter.delete('/users/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id: idString } = ctx.params;
    const id = parseInt(idString);
    if (!Number.isInteger(id) || id < 0) {
      ctx.status = 400;
      ctx.body = { message: `Invalid user id: ${idString}` };
      return;
    }
    if (id === 0) {
      (ctx.status = 403), (ctx.body = { message: `You cannot delete admin` });
      return;
    }
    const user = await getUserById(id);
    if (!user) {
      (ctx.status = 404), (ctx.body = { message: `There is no user with id: ${id}` });
      return;
    }
    await deleteUser(id);
    ctx.status = 204;
  } catch (error) {
    ctx.status = 500;
    console.error(error);
    ctx.body = { message: 'Internal error' };
  }
});

userRouter.get('/users', requireAuth, requireAdmin, async (ctx) => {
  try {
    const users = await getUsersList();
    ctx.body = users;
  } catch (error) {
    ctx.status = 500;
    console.error(error);
    ctx.body = { message: 'Internal error' };
  }
});

export default userRouter;
