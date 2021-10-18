const path = require('path');
const grpc = require('grpc');
const grpcPromise = require('grpc-promise');
const protoLoader = require('../../modules/grpc-service/proto-loader');

function init() {
  const protoPath = path.join(__dirname, '..', '..', '/protobuf/follower.proto');
  const protoPackage = 'follower_node';
  const protoService = 'FollowerService';

  const createClient = ({
    url,
    port,
  }) => {
    const protoDescriptor = protoLoader(protoPath);
    const proto = protoDescriptor[protoPackage];
    const grpcClient = new proto[protoService](`${url}:${port}`, grpc.credentials.createInsecure());
    grpcPromise.promisifyAll(grpcClient);

    const client = {
      append(message) {
        return grpcClient
          .append()
          .sendMessage(message);
      },
    };

    return client;
  };

  return createClient;
}

module.exports = init;
