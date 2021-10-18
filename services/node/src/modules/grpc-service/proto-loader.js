const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const protoLoadParams = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const cache = new Map();

function loadProtoDescriptor(path) {
  if (!cache.has(path)) {
    const packageDefinition = protoLoader
      .loadSync(path, protoLoadParams);

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    cache.set(path, protoDescriptor);
  }

  return cache.get(path);
}

module.exports = loadProtoDescriptor;
