const defaultConfig = {
  // put default config prop values here
};

const envConfig = {
  env: process.env.ENV,
  clientRestApiPort: process.env.SERVER_PORT,
  storeType: process.env.STORE_TYPE,
  nodeType: process.env.NODE_MODE,
  grpcServerUrl: process.env.HOSTNAME,
  grpcServerPort: process.env.GRPC_SERVER_PORT,
  leaderGrpcServerUrl: process.env.LEADER_GRPC_SERVER_URL,
  leaderGrpcServerPort: process.env.LEADER_GRPC_SERVER_PORT,
  followerFakeDeelay: process.env.FOLLOWER_FAKE_DEELAY || 0,
};

const config = Object.freeze({
  ...defaultConfig,
  ...envConfig,
});

module.exports = config;
