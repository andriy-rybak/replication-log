const pino = require('pino');
const config = require('./config');

const logger = pino();

const initNodeServer = config.nodeType === 'LEADER_NODE'
  ? require('./leader-server')
  : require('./follower-server');

initNodeServer(config);

function exitHandler(options, exitCode) {
  if (options.cleanup) logger.info('clean');
  if (exitCode || exitCode === 0) logger.info(exitCode);
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
