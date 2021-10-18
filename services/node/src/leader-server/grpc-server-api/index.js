function init({ services }) {
  const {
    replicator,
  } = services;

  return {
    async registerFollower(ctx, next) {
      const { url, port } = ctx.req;
      const success = await replicator.register({ url, port });
      ctx.res = { success };
      await next();
    },
    async getFollowers(ctx, next) {
      const followers = replicator
        .getFollowers()
        .map(({ id, registeredAt, config: { url, port } }) => ({
          id,
          registeredAt,
          url,
          port,
        }));
      ctx.res = { followers };
      await next();
    },
  };
}

module.exports = init;
