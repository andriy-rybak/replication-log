const pino = require('pino');
const path = require('path');

const { initManager } = require('../modules/manager-service');
const LeaderManager = require('../modules/manager-service/leader-manager');
const { initStorage } = require('../modules/storage-service');
const { initReplicator } = require('../modules/replicator-service');

const createApp = require('../modules/express-app');
const clientRestApi = require('./client-rest-api');

const initFollowerGrpcClient = require('./grpc-follower-client');

const initGrpcServer = require('../modules/grpc-service/grpc-server');
const initGrpcServerApi = require('./grpc-server-api');

const logger = pino();

function initServices(config) {
  const { storeType } = config;
  const storage = initStorage({
    type: storeType,
  });

  const replicator = initReplicator({
    factory: initFollowerGrpcClient(),
  });

  const manager = initManager({
    manager: LeaderManager,
    storage,
    replicator,
  });

  const services = {
    storage,
    replicator,
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

  const leaderProtoPath = path.join(__dirname, '..', '/protobuf/leader.proto');
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
    protoPath: leaderProtoPath,
    name: 'LeaderService',
    config,
  });
}

module.exports = initServices;
