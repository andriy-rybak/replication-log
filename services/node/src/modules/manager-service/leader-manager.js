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

  async appendMessage(body) {
    const id = uuidv4();
    const createdAt = new Date().getTime();
    const message = {
      id,
      body,
      createdAt,
    };

    logger.info({ message }, 'Appending message to storage.');

    const replicated = await this.replicator.append(message);
    if (replicated) {
      await this.storage.append(message);
      return id;
    }

    return null;
  }
}

module.exports = LeaderManager;
