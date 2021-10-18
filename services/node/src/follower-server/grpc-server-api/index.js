function init({
  services,
}) {
  const {
    manager,
  } = services;

  return {
    async append(ctx, next) {
      const { id, createdAt, body } = ctx.req;
      await manager.appendMessage({ id, createdAt, body });
      ctx.res = { success: true };
      await next();
    },
  };
}

module.exports = init;
