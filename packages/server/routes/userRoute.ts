import Router from 'koa-router';
import { requireAuth } from '../middleware/authMiddleware';
import { createUser, deleteUser, getUsersList } from '../controllers/userController';
import { requireAdmin } from '../middleware/adminMiddleware';
import User from '../models/User';
import { getUserById } from '../db/users';

const userRouter = new Router();

userRouter.post('/users', requireAuth, requireAdmin, async (ctx) => {
  try {
    const id = await createUser(ctx.request.body as User);
    ctx.status = 201;
    ctx.body = { id };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error };
  }
});

userRouter.delete('/users/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id: idString } = ctx.params;
    const id = parseInt(idString);
    if (id === 0) {
      (ctx.status = 403), (ctx.body = { message: `You cannot delete admin` });
      return;
    }
    const user = await getUserById(id);
    await console.log(id);
    await console.log(user);
    if (!user) {
      (ctx.status = 404), (ctx.body = { message: `There is no user with id: ${id}` });
      return;
    }
    await deleteUser(id);
    ctx.status = 204;
  } catch (error) {
    ctx.status = 500;
    console.error(error);
    ctx.body = { error };
  }
});

userRouter.get('/users', requireAuth, requireAdmin, async (ctx) => {
  try {
    const users = await getUsersList();
    ctx.body = users;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error };
  }
});

export default userRouter;
