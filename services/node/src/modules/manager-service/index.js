let INSTANCE = null;

function getManager() {
  if (!INSTANCE) {
    throw new Error('Manager instance must be initialised first.');
  }

  return INSTANCE;
}

function initManager({
  manager: Manager,
  ...config
}) {
  if (!INSTANCE) {
    INSTANCE = new Manager({
      ...config,
    });
  }

  return INSTANCE;
}

module.exports = {
  getManager,
  initManager,
};
