const Mali = require('mali');
const pino = require('pino');

const logger = pino();

function init({
  port,
  url,
  api,
  protoPath,
  name,
  config,
}) {
  const app = new Mali(protoPath, name);

  app.use(async (ctx, next) => {
    ctx.config = config;
    await next();
  });

  app.use(async (ctx, next) => {
    logger.info({ req: ctx.req }, `GRPC request "${ctx.name}" started.`);
    await next();
  });

  app.use(api);

  app.use(async (ctx, next) => {
    await next();
    logger.info({ res: ctx.res }, `GRPC request "${ctx.name}" finished.`);
  });

  app.start(`${url}:${port}`);
  logger.info({ config }, `GRPC server started at http://127.0.0.1:${port}`);
}

module.exports = init;
