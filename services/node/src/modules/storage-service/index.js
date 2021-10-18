class InMemoryStorage {
  constructor() {
    this.store = [];
  }

  async getAll() {
    return this.store;
  }

  async append(msg) {
    this.store.push(msg);
  }
}

let INSTANCE = null;

const [IN_MEM_STORE] = ['IN_MEM_STORE'];

const stores = {
  [IN_MEM_STORE]: InMemoryStorage,
};

function getStorage() {
  if (!INSTANCE) {
    throw new Error('Store instance must be initialised first.');
  }

  return INSTANCE;
}

function initStorage({
  type,
}) {
  if (!INSTANCE) {
    INSTANCE = new stores[type]();
  }

  return INSTANCE;
}

module.exports = {
  initStorage,
  getStorage,
};
