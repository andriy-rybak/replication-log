const pinoHttp = require('pino-http')();

function pinoMiddleware(app) {
  app.use(pinoHttp);
}

module.exports = pinoMiddleware;
