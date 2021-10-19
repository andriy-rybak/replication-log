# Replicated Log

### Notes
* Update replication API to rely on [GRPC Stream](https://grpc.io/docs/languages/node/basics/#streaming-rpcs) (instead of regular API calls)
* Switch to [grpc-client](https://www.npmjs.com/package/node-grpc-client) npm package (instead of the raw grpc lib)
* Registration should be made through a separate configuration service (zookeeper-like custom service)
* Follower-to-Leader promotion should be added with all the consequent tactics (e.g. split-brain, etc.)
* Any security and contract/data validation is out of scope!

## Instructions
### Requirements:
* `docker` and `docker-compose` to run the cluster
* `curl` and `jq` to make example requests
### Start:
```bash
# Run cluster with 2 seconds deelay in each follower node.
FOLLOWER_FAKE_DEELAY=2000 docker-compose up --build
```
`docker-compose.yml` by default is configured to run single instance of `leader` at `3000` port node and 3 instances of `follower` nodes at ports range `3001-3003`. To change this behavior consider using the following var env vars:

| Env Var | Description | Default | 
| ------- | ----------- | ------- |
| `FOLLOWER_FAKE_DEELAY` | Value of the fake deelay to be introduced in each follower node. | 0 |
| `LEADER_PORT` | Port which is used for leader (writer) node client API. | 3000 |
| `FOLLOWER_PORTS_RANGE` | Ports range which is used for follower (reader) nodes. WARNING: range must container exactly `FOLLOWER_SCALE_FACTOR` number of ports. Otherwise you will get ports collision error. | 3001-3003 |
| `FOLLOWER_SCALE_FACTOR` | Number of follower node instances. WARNING: correlate this value only with `FOLLOWER_PORTS_RANGE` otherwise you will get ports collision error. | 3 |
### Usage:
```bash
# Append message to the leader node:
curl -X POST localhost:3000/api/messages \
   -H "Content-Type: application/json" \
   -d '{"body": "Some message to store"}' | jq

# Get all messages from the leader node:
curl -X GET localhost:3000/api/messages | jq

# Get all messages from the follower node number 1:
curl -X GET localhost:3001/api/messages | jq

# Get all messages from the follower node number 2:
curl -X GET localhost:3002/api/messages | jq

# Get all messages from the follower node number 3:
curl -X GET localhost:3003/api/messages | jq
```
