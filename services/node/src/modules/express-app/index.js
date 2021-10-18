const express = require('express');

const loggerMiddleware = require('./middlewares/pino-middleware');
const extReqMiddleware = require('./middlewares/ext-req-middleware');

function createApp({ api, config, services }) {
  const app = express();

  app.use(express.json());
  extReqMiddleware('config')(app, config);
  extReqMiddleware('services')(app, services);
  loggerMiddleware(app);

  app.use(api);

  app.use((req, res) => {
    res.status(404).send('Not Found');
  });

  return app;
}

module.exports = createApp;
