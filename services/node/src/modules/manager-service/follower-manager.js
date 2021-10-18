const pino = require('pino');

const logger = pino({ name: 'Follower Manager' });

async function deelay(value) {
  return new Promise((resolve) => setTimeout(resolve, value));
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
    logger.debug({ message }, 'Appending message to storage.');
    await deelay(this.followerFakeDeelay);
    return await this.storage.append(message);
  }
}

module.exports = FollowerManager;
