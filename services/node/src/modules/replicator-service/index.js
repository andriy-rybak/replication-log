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

  async append({ message, writeConcern }) {
    // TODO rewrite to EventEmitter implementation
    try {
      logger.info({ message, writeConcern }, 'Replicating message to followers.');
      return new Promise((resolve) => {
        const wc = Number.isInteger(writeConcern)
          ? Math.min(writeConcern - 1, this.followers.length)
          : this.followers.length;

        let success = 0;
        let fails = 0;

        const conditinalResolve = () => {
          if (success === wc) {
            logger.info({
              message, wc, success, fails,
            }, `Message successfully replicated with factor ${wc + 1}.`);
            resolve(true);
          }
          if (this.followers.length - fails < wc) {
            logger.warn({
              message, wc, success, fails,
            }, `Message failed to be replicated with factor ${wc + 1}.`);
            resolve(false);
          }
        };

        const run = async (follower) => {
          const { client, id } = follower;
          logger.info({
            id, message, wc, success, fails,
          }, `Replicating message to follower ${id}.`);
          try {
            await client.append(message);
            success += 1;
          } catch (error) {
            logger.error(error, `Replication of ${message} failed for follower ${id}.`);
            fails += 1;
          } finally {
            conditinalResolve();
          }
        };

        this.followers.forEach(run);

        conditinalResolve();
      });
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
