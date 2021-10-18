const pino = require('pino');
const { v4: uuidv4 } = require('uuid');

const logger = pino({ name: 'Replicator' });

class Replicator {
  constructor({ factory }) {
    this.followers = [];
    this.factory = factory;
  }

  register({ url, port }) {
    const id = uuidv4();
    const registeredAt = new Date().getTime();
    const config = { url, port };
    const client = this.factory(config);

    const follower = {
      id,
      registeredAt,
      config,
      client,
    };

    logger.info({ follower }, `Registering follower ${id}.`);
    this.followers.push(follower);

    return id;
  }

  getFollowers() {
    logger.info({ followers: this.followers }, 'Returning all registered followers.');
    return this.followers;
  }

  async append(message) {
    try {
      const res = await Promise.all(
        this.followers
          .map(async (follower) => {
            const { client, id } = follower;
            logger.info({ id, message }, `Replicating message to follower ${id}.`);
            try {
              await client.append(message);
            } catch (error) {
              logger.error(error, `Replication of ${message} failed to follower ${id}.`);
            }
            return true;
          }),
      );

      return res.reduce((result, success) => result && success, true);
    } catch (e) {
      return false;
    }
  }

  unregister(id) { // eslint-disable-line
    throw new Error('Not implemented');
  }
}

let INSTANCE = null;

function getReplicator() {
  if (!INSTANCE) {
    throw new Error('Replicator instance must be initialised first.');
  }

  return INSTANCE;
}

function initReplicator(config) {
  if (!INSTANCE) {
    INSTANCE = new Replicator(config);
  }

  return INSTANCE;
}

module.exports = {
  initReplicator,
  getReplicator,
};
