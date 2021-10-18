const path = require('path');
const grpc = require('grpc');
const grpcPromise = require('grpc-promise');
const protoLoader = require('../../modules/grpc-service/proto-loader');

function init({
  url,
  port,
}) {
  const protoPath = path.join(__dirname, '..', '..', '/protobuf/leader.proto');
  const protoPackage = 'leader_node';
  const protoService = 'LeaderService';

  const protoDescriptor = protoLoader(protoPath);
  const proto = protoDescriptor[protoPackage];
  const grpcClient = new proto[protoService](`${url}:${port}`, grpc.credentials.createInsecure());
  grpcPromise.promisifyAll(grpcClient);

  const client = {
    registerFollower(message) {
      return grpcClient
        .registerFollower()
        .sendMessage(message);
    },
  };

  return client;
}

module.exports = init;
