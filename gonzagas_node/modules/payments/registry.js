const providers = new Map();

function registerProvider(name, impl) {
  providers.set(name, impl);
}

function getProvider(name) {
  return providers.get(name) || null;
}

function listProviders() {
  return [...providers.keys()];
}

module.exports = {
  registerProvider,
  getProvider,
  listProviders,
};
