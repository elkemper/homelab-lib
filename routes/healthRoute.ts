import Router from "koa-router";

const healthRoute = new Router();
healthRoute.get('/health', async (ctx) => {
  try {
    ctx.body = {
      success: true,
    };
  } catch (e) {
    console.error(e);
  }
});
export default healthRoute