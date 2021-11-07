const { v4: uuidv4 } = require('uuid');
const pino = require('pino');

const logger = pino({ name: 'Leader Manager' });
class LeaderManager {
  constructor({
    storage,
    replicator,
  }) {
    this.storage = storage;
    this.replicator = replicator;
  }

  async readAllMessages() {
    return await this.storage.getAll();
  }

  async appendMessage({ body, writeConcern }) {
    const id = uuidv4();
    const createdAt = new Date().getTime();
    const message = {
      id,
      body,
      createdAt,
    };

    logger.info({ message, writeConcern }, 'Appending message to follower storage.');
    await this.replicator.append({ message, writeConcern });

    logger.info({ message, writeConcern }, 'Appending message to leader storage.');
    await this.storage.append(message);
    return id;
  }
}

module.exports = LeaderManager;
