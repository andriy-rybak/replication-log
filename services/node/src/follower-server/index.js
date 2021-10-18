const pino = require('pino');
const path = require('path');

const { initManager } = require('../modules/manager-service');
const FollowerManager = require('../modules/manager-service/follower-manager');
const { initStorage } = require('../modules/storage-service');

const createApp = require('../modules/express-app');
const clientRestApi = require('./client-rest-api');

const initLeaderGrpcClient = require('./grpc-leader-client');

const initGrpcServer = require('../modules/grpc-service/grpc-server');
const initGrpcServerApi = require('./grpc-server-api');

const logger = pino();

async function initServices(config) {
  const { storeType, followerFakeDeelay } = config;
  const storage = initStorage({
    type: storeType,
  });

  const manager = initManager({
    manager: FollowerManager,
    storage,
    followerFakeDeelay,
  });

  const services = {
    storage,
    manager,
  };

  const {
    clientRestApiPort,
  } = config;
  createApp({
    api: clientRestApi,
    config,
    services,
  }).listen(clientRestApiPort, () => {
    logger.info({ config }, `REST server started at http://127.0.0.1:${clientRestApiPort}`);
  });

  const followerProtoPath = path.join(__dirname, '..', '/protobuf/follower.proto');
  const grpcServerApi = initGrpcServerApi({
    services,
    config,
  });
  const {
    grpcServerUrl,
    grpcServerPort,
  } = config;
  initGrpcServer({
    api: grpcServerApi,
    url: grpcServerUrl,
    port: grpcServerPort,
    protoPath: followerProtoPath,
    name: 'FollowerService',
    config,
  });

  try {
    const {
      leaderGrpcServerUrl,
      leaderGrpcServerPort,
    } = config;
    const client = initLeaderGrpcClient({
      url: leaderGrpcServerUrl,
      port: leaderGrpcServerPort,
    });
    await client.registerFollower({
      url: grpcServerUrl,
      port: grpcServerPort,
    });
  } catch (error) {
    logger.error(error, 'Failed to register the follower node.');
  }
}

module.exports = initServices;
