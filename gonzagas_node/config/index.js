// Exporta as configurações principais
const config = require('./config');
const database = require('./database');
const modules = require('./modules');

module.exports = {
  ...config,
  database,
  modules,
  // Adicione outras exportações conforme necessário
};
