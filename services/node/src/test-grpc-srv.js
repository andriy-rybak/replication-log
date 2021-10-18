const path = require('path');
const grpc = require('grpc');
const grpcPromise = require('grpc-promise');
const protoLoader = require('./modules/grpc-service/proto-loader');

const protoPath = path.join(__dirname, '/protobuf/leader.proto');
const protoPackage = 'leader_node';
const protoService = 'LeaderService';
const url = 'localhost';
const port = 50051;
const protoDescriptor = protoLoader(protoPath);
const proto = protoDescriptor[protoPackage];
const client = new proto[protoService](`${url}:${port}`, grpc.credentials.createInsecure());
grpcPromise.promisifyAll(client);

Promise.resolve()
// client
//   .registerFollower()
//   .sendMessage({
//     url: 'localhost',
//     port: 101010,
//   })
  .then((res) => console.log(res))
  .catch((err) => console.error(err))
  .then(() => client
    .getFollowers()
    .sendMessage())
  .then((res) => console.log(res));
