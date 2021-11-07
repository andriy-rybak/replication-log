const pino = require('pino');

const logger = pino({ name: 'Follower Manager' });

async function deelay(value) {
  const randVal = Math.round(Math.random() * (value));
  logger.info({ randVal }, `Deelying request for ${randVal} ms.`);
  return new Promise((resolve) => setTimeout(resolve, randVal));
}

class FollowerManager {
  constructor({
    storage,
    followerFakeDeelay,
  }) {
    this.storage = storage;
    this.followerFakeDeelay = followerFakeDeelay;
  }

  async readAllMessages() {
    return await this.storage.getAll();
  }

  async appendMessage(message) {
    await deelay(this.followerFakeDeelay);
    logger.info({ message }, 'Appending message to storage.');
    return await this.storage.append(message);
  }
}

module.exports = FollowerManager;
