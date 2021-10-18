function middleware(app, prop, data) {
  app.use((req, resp, next) => {
    req[prop] = data;
    next();
  });
}

function extReqMiddleware(prop) {
  return (app, data) => middleware(app, prop, data);
}

module.exports = extReqMiddleware;
