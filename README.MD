# Replicated Log

### Notes
* Update replication API to rely on [GRPC Stream](https://grpc.io/docs/languages/node/basics/#streaming-rpcs) (instead of regular API calls)
* Switch to [grpc-client](https://www.npmjs.com/package/node-grpc-client) npm package (instead of the raw grpc lib)
* Registration should be made through a separate configuration service (zookeeper-like custom service)
* Follower-to-Leader promotion should be added with all the consequent tactics (e.g. split-brain, etc.)
* Any security and contract/data validation is out of scope!
* Add randomised deelay on each separate node instance-level for better flexibility (to test distributed problem cases)

## Instructions
### Requirements:
* `docker` and `docker-compose` to run the cluster
* `curl` and `jq` to make example requests
* Make sure ports `3000-3003` are available
### Start:
```bash
# Run cluster with 2 seconds deelay in each follower node.
FOLLOWER_FAKE_DEELAY=2000 docker-compose up --build
```
`docker-compose.yml` by default is configured to run single instance of `leader` at `3000` port node and 3 instances of `follower` nodes at ports range `3001-3003`. To change this behavior consider using the following var env vars:

| Env Var | Description | Default | 
| ------- | ----------- | ------- |
| `FOLLOWER_FAKE_DEELAY` | Value of the fake deelay to be introduced in each follower node: the deelay is calculated randomly on each request with the provided value as a maximum. E.g.: if value is 3000 the delay is from 0 up to 3 seconds  | 0 |
| `LEADER_PORT` | Port which is used for leader (writer) node client API. | 3000 |
| `FOLLOWER_PORTS_RANGE` | Ports range which is used for follower (reader) nodes. WARNING: range must container exactly `FOLLOWER_SCALE_FACTOR` number of ports. Otherwise you will get ports collision error. | 3001-3003 |
| `FOLLOWER_SCALE_FACTOR` | Number of follower node instances. WARNING: correlate this value only with `FOLLOWER_PORTS_RANGE` otherwise you will get ports collision error. | 3 |
### Usage:
```bash
# Append message to the leader node with write concern 4:
curl -X POST localhost:3000/api/messages \
   -H "Content-Type: application/json" \
   -d '{"body": "Some message to store", "writeConcern": 4}' | jq

# Get all messages from the leader node:
curl -X GET localhost:3000/api/messages | jq

# Get all messages from the follower node number 1:
curl -X GET localhost:3001/api/messages | jq

# Get all messages from the follower node number 2:
curl -X GET localhost:3002/api/messages | jq

# Get all messages from the follower node number 3:
curl -X GET localhost:3003/api/messages | jq
```

### Logging reports:
The next sections contain short logging report outcomes from various test-cases.
#### **Test case #1:**
* Write concern: 4
* Setup: 1 Leader node and 3 follower nodes
* Result: success
```
follower_3  | {"level":30,"time":1636306695368,"pid":19,"hostname":"0e11a9505124","name":"Follower Manager","message":{"id":"63bfc0d2-73de-4b0e-b343-790381bbeb95","createdAt":"1636306693466","body":"Some message to store"},"msg":"Appending message to storage."}
follower_2  | {"level":30,"time":1636306695625,"pid":19,"hostname":"4a79def3ef25","name":"Follower Manager","message":{"id":"63bfc0d2-73de-4b0e-b343-790381bbeb95","createdAt":"1636306693466","body":"Some message to store"},"msg":"Appending message to storage."}
follower_1  | {"level":30,"time":1636306695825,"pid":19,"hostname":"9a98a5b82c12","name":"Follower Manager","message":{"id":"63bfc0d2-73de-4b0e-b343-790381bbeb95","createdAt":"1636306693466","body":"Some message to store"},"msg":"Appending message to storage."}
leader_1    | {"level":30,"time":1636306695827,"pid":18,"hostname":"2156be256002","name":"Replicator","message":{"id":"63bfc0d2-73de-4b0e-b343-790381bbeb95","body":"Some message to store","createdAt":1636306693466},"wc":3,"success":3,"fails":2,"msg":"Message successfully replicated with factor 3."}
leader_1    | {"level":30,"time":1636306695827,"pid":18,"hostname":"2156be256002","name":"Leader Manager","message":{"id":"63bfc0d2-73de-4b0e-b343-790381bbeb95","body":"Some message to store","createdAt":1636306693466},"writeConcern":4,"msg":"Appending message to leader storage."}
leader_1    | {"level":30,"time":1636306695828,"pid":18,"hostname":"2156be256002","req":{"id":9,"method":"POST","url":"/api/messages","query":{},"params":{},"headers":{"host":"localhost:3000","user-agent":"curl/7.64.1","accept":"*/*","content-type":"application/json","content-length":"52"},"remoteAddress":"::ffff:192.168.80.1","remotePort":64050},"res":{"statusCode":200,"headers":{"x-powered-by":"Express","content-type":"application/json; charset=utf-8","content-length":"45","etag":"W/\"2d-6cvj4/vjENL4T8rskCNcgEjg8XQ\""}},"responseTime":2362,"msg":"request completed"}
```
#### **Test case #2:**
* Write concern: 2
* Setup: 1 Leader node and 3 follower nodes
* Result: success
```
follower_2  | {"level":30,"time":1636307348692,"pid":19,"hostname":"4a79def3ef25","name":"Follower Manager","message":{"id":"46436bde-8294-4056-8e8c-b3d4d4013aad","createdAt":"1636307347964","body":"Some message to store"},"msg":"Appending message to storage."}
leader_1    | {"level":30,"time":1636307348693,"pid":18,"hostname":"2156be256002","name":"Replicator","message":{"id":"46436bde-8294-4056-8e8c-b3d4d4013aad","body":"Some message to store","createdAt":1636307347964},"wc":1,"success":1,"fails":2,"msg":"Message successfully replicated with factor 1."}
leader_1    | {"level":30,"time":1636307348693,"pid":18,"hostname":"2156be256002","name":"Leader Manager","message":{"id":"46436bde-8294-4056-8e8c-b3d4d4013aad","body":"Some message to store","createdAt":1636307347964},"writeConcern":2,"msg":"Appending message to leader storage."}
leader_1    | {"level":30,"time":1636307348695,"pid":18,"hostname":"2156be256002","req":{"id":11,"method":"POST","url":"/api/messages","query":{},"params":{},"headers":{"host":"localhost:3000","user-agent":"curl/7.64.1","accept":"*/*","content-type":"application/json","content-length":"52"},"remoteAddress":"::ffff:192.168.80.1","remotePort":64054},"res":{"statusCode":200,"headers":{"x-powered-by":"Express","content-type":"application/json; charset=utf-8","content-length":"45","etag":"W/\"2d-ZNW00PM6j7dgicCbSRGUtGjvgQw\""}},"responseTime":730,"msg":"request completed"}
follower_3  | {"level":30,"time":1636307350111,"pid":19,"hostname":"0e11a9505124","name":"Follower Manager","message":{"id":"46436bde-8294-4056-8e8c-b3d4d4013aad","createdAt":"1636307347964","body":"Some message to store"},"msg":"Appending message to storage."}
follower_1  | {"level":30,"time":1636307350908,"pid":19,"hostname":"9a98a5b82c12","name":"Follower Manager","message":{"id":"46436bde-8294-4056-8e8c-b3d4d4013aad","createdAt":"1636307347964","body":"Some message to store"},"msg":"Appending message to storage."}
```
#### **Test case #3:**
* Write concern: 1
* Setup: 1 Leader node and 3 follower nodes
* Result: success
```
```leader_1    | {"level":30,"time":1636307460277,"pid":18,"hostname":"2156be256002","name":"Replicator","message":{"id":"fd7ce55b-dfc0-40fb-a015-f82a3714c2a7","body":"Some message to store","createdAt":1636307460273},"wc":0,"success":0,"fails":1,"msg":"Message successfully replicated with factor 0."}
leader_1    | {"level":50,"time":1636307460277,"pid":18,"hostname":"2156be256002","name":"Replicator","err":{"type":"Error","message":"14 UNAVAILABLE: DNS resolution failed","stack":"Error: 14 UNAVAILABLE: DNS resolution failed\n    at Object.exports.createStatusError (/app/node_modules/grpc/src/common.js:91:15)\n    at Object.onReceiveStatus (/app/node_modules/grpc/src/client_interceptors.js:1209:28)\n    at InterceptingListener._callNext (/app/node_modules/grpc/src/client_interceptors.js:568:42)\n    at InterceptingListener.onReceiveStatus (/app/node_modules/grpc/src/client_interceptors.js:618:8)\n    at callback (/app/node_modules/grpc/src/client_interceptors.js:847:24)","code":14,"metadata":{"_internal_repr":{},"flags":0},"details":"DNS resolution failed"},"msg":"Replication of [object Object] failed for follower 1954aaf0-9990-476c-943e-e132030f7fc2."}
leader_1    | {"level":30,"time":1636307460277,"pid":18,"hostname":"2156be256002","name":"Replicator","message":{"id":"fd7ce55b-dfc0-40fb-a015-f82a3714c2a7","body":"Some message to store","createdAt":1636307460273},"wc":0,"success":0,"fails":2,"msg":"Message successfully replicated with factor 0."}
follower_2  | {"level":30,"time":1636307462109,"pid":19,"hostname":"4a79def3ef25","name":"Follower Manager","message":{"id":"fd7ce55b-dfc0-40fb-a015-f82a3714c2a7","createdAt":"1636307460273","body":"Some message to store"},"msg":"Appending message to storage."}
follower_3  | {"level":30,"time":1636307462155,"pid":19,"hostname":"0e11a9505124","name":"Follower Manager","message":{"id":"fd7ce55b-dfc0-40fb-a015-f82a3714c2a7","createdAt":"1636307460273","body":"Some message to store"},"msg":"Appending message to storage."}
follower_1  | {"level":30,"time":1636307463092,"pid":19,"hostname":"9a98a5b82c12","name":"Follower Manager","message":{"id":"fd7ce55b-dfc0-40fb-a015-f82a3714c2a7","createdAt":"1636307460273","body":"Some message to store"},"msg":"Appending message to storage."}
```
#### **Test case #4:**
* Write concern: 2
* Setup: 1 Leader node, 2 of 3 follower nodes up; 1 of 3 follower nodes failed
* Result: success
```
follower_3  | {"level":30,"time":1636307672319,"pid":19,"hostname":"0e11a9505124","name":"Follower Manager","message":{"id":"e29490be-309c-4b45-baed-2f4d801794c2","createdAt":"1636307672070","body":"Some message to store"},"msg":"Appending message to storage."}
leader_1    | {"level":30,"time":1636307672320,"pid":18,"hostname":"2156be256002","name":"Replicator","message":{"id":"e29490be-309c-4b45-baed-2f4d801794c2","body":"Some message to store","createdAt":1636307672070},"wc":1,"success":1,"fails":2,"msg":"Message successfully replicated with factor 1."}
leader_1    | {"level":30,"time":1636307672320,"pid":18,"hostname":"2156be256002","name":"Leader Manager","message":{"id":"e29490be-309c-4b45-baed-2f4d801794c2","body":"Some message to store","createdAt":1636307672070},"writeConcern":2,"msg":"Appending message to leader storage."}
leader_1    | {"level":30,"time":1636307672321,"pid":18,"hostname":"2156be256002","req":{"id":14,"method":"POST","url":"/api/messages","query":{},"params":{},"headers":{"host":"localhost:3000","user-agent":"curl/7.64.1","accept":"*/*","content-type":"application/json","content-length":"52"},"remoteAddress":"::ffff:192.168.80.1","remotePort":64066},"res":{"statusCode":200,"headers":{"x-powered-by":"Express","content-type":"application/json; charset=utf-8","content-length":"45","etag":"W/\"2d-bPVJo+fvI+kr39yZ+e9r5SNaU/0\""}},"responseTime":251,"msg":"request completed"}
leader_1    | {"level":50,"time":1636307673525,"pid":18,"hostname":"2156be256002","name":"Replicator","err":{"type":"Error","message":"14 UNAVAILABLE: failed to connect to all addresses","stack":"Error: 14 UNAVAILABLE: failed to connect to all addresses\n    at Object.exports.createStatusError (/app/node_modules/grpc/src/common.js:91:15)\n    at Object.onReceiveStatus (/app/node_modules/grpc/src/client_interceptors.js:1209:28)\n    at InterceptingListener._callNext (/app/node_modules/grpc/src/client_interceptors.js:568:42)\n    at InterceptingListener.onReceiveStatus (/app/node_modules/grpc/src/client_interceptors.js:618:8)\n    at callback (/app/node_modules/grpc/src/client_interceptors.js:847:24)","code":14,"metadata":{"_internal_repr":{},"flags":0},"details":"failed to connect to all addresses"},"msg":"Replication of [object Object] failed for follower 5188d4bc-d808-4add-b4ab-1f855aee3c05."}
leader_1    | {"level":30,"time":1636307673525,"pid":18,"hostname":"2156be256002","name":"Replicator","message":{"id":"e29490be-309c-4b45-baed-2f4d801794c2","body":"Some message to store","createdAt":1636307672070},"wc":1,"success":1,"fails":3,"msg":"Message successfully replicated with factor 1."}
follower_2  | {"level":30,"time":1636307674012,"pid":19,"hostname":"4a79def3ef25","name":"Follower Manager","message":{"id":"e29490be-309c-4b45-baed-2f4d801794c2","createdAt":"1636307672070","body":"Some message to store"},"msg":"Appending message to storage."}
```
#### **Test case #5:**
* Write concern: 3
* Setup: 1 Leader node, 1 of 3 follower nodes up; 2 of 3 follower nodes failed
* Result: failure
```
leader_1    | {"level":50,"time":1636307799805,"pid":18,"hostname":"2156be256002","name":"Replicator","err":{"type":"Error","message":"14 UNAVAILABLE: failed to connect to all addresses","stack":"Error: 14 UNAVAILABLE: failed to connect to all addresses\n    at Object.exports.createStatusError (/app/node_modules/grpc/src/common.js:91:15)\n    at Object.onReceiveStatus (/app/node_modules/grpc/src/client_interceptors.js:1209:28)\n    at InterceptingListener._callNext (/app/node_modules/grpc/src/client_interceptors.js:568:42)\n    at InterceptingListener.onReceiveStatus (/app/node_modules/grpc/src/client_interceptors.js:618:8)\n    at callback (/app/node_modules/grpc/src/client_interceptors.js:847:24)","code":14,"metadata":{"_internal_repr":{},"flags":0},"details":"failed to connect to all addresses"},"msg":"Replication of [object Object] failed for follower 5188d4bc-d808-4add-b4ab-1f855aee3c05."}
follower_2  | {"level":30,"time":1636307800604,"pid":19,"hostname":"4a79def3ef25","name":"Follower Manager","message":{"id":"c5681bc3-e395-45db-b9f0-6d31ac84aede","createdAt":"1636307799800","body":"Some message to store"},"msg":"Appending message to storage."}
leader_1    | {"level":50,"time":1636307802854,"pid":18,"hostname":"2156be256002","name":"Replicator","err":{"type":"Error","message":"14 UNAVAILABLE: failed to connect to all addresses","stack":"Error: 14 UNAVAILABLE: failed to connect to all addresses\n    at Object.exports.createStatusError (/app/node_modules/grpc/src/common.js:91:15)\n    at Object.onReceiveStatus (/app/node_modules/grpc/src/client_interceptors.js:1209:28)\n    at InterceptingListener._callNext (/app/node_modules/grpc/src/client_interceptors.js:568:42)\n    at InterceptingListener.onReceiveStatus (/app/node_modules/grpc/src/client_interceptors.js:618:8)\n    at callback (/app/node_modules/grpc/src/client_interceptors.js:847:24)","code":14,"metadata":{"_internal_repr":{},"flags":0},"details":"failed to connect to all addresses"},"msg":"Replication of [object Object] failed for follower d437ee2e-3ff7-47f4-be76-75c27c11a830."}
leader_1    | {"level":40,"time":1636307802854,"pid":18,"hostname":"2156be256002","name":"Replicator","message":{"id":"c5681bc3-e395-45db-b9f0-6d31ac84aede","body":"Some message to store","createdAt":1636307799800},"wc":2,"success":1,"fails":4,"msg":"Message failed to be replicated with factor 2."}
leader_1    | {"level":30,"time":1636307802855,"pid":18,"hostname":"2156be256002","req":{"id":15,"method":"POST","url":"/api/messages","query":{},"params":{},"headers":{"host":"localhost:3000","user-agent":"curl/7.64.1","accept":"*/*","content-type":"application/json","content-length":"52"},"remoteAddress":"::ffff:192.168.80.1","remotePort":64082},"res":{"statusCode":500,"headers":{"x-powered-by":"Express","content-type":"application/json; charset=utf-8","content-length":"12","etag":"W/\"c-3Rk1bge0s6VuJbi+S2m2iU0UGdY\""}},"err":{"type":"Error","message":"failed with status code 500","stack":"Error: failed with status code 500\n    at ServerResponse.onResFinished (/app/node_modules/pino-http/logger.js:77:38)\n    at ServerResponse.emit (events.js:412:35)\n    at onFinish (_http_outgoing.js:792:10)\n    at callback (internal/streams/writable.js:513:21)\n    at afterWrite (internal/streams/writable.js:466:5)\n    at afterWriteTick (internal/streams/writable.js:453:10)\n    at processTicksAndRejections (internal/process/task_queues.js:81:21)"},"responseTime":3055,"msg":"request errored"}
```
