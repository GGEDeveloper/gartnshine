/**
 * Configuração dos Módulos
 * 
 * Este arquivo gerencia o carregamento e configuração de todos os módulos do sistema.
 */

const path = require('path');
const fs = require('fs');

// Lista de módulos ativos
const activeModules = [
  'core',
  'clients',
  'suppliers',
  'products',
  'inventory',
  'sales',
  'financial'
];

// Objeto para armazenar os módulos carregados
const modules = {};

// Carrega todos os módulos ativos
activeModules.forEach(moduleName => {
  const modulePath = path.join(__dirname, '../modules', moduleName);
  
  // Verifica se o módulo existe
  if (fs.existsSync(modulePath)) {
    try {
      // Carrega o módulo
      modules[moduleName] = require(modulePath);
      console.log(`✅ Módulo carregado: ${moduleName}`);
    } catch (error) {
      console.error(`❌ Erro ao carregar o módulo ${moduleName}:`, error.message);
    }
  } else {
    console.warn(`⚠️  Módulo não encontrado: ${moduleName}`);
  }
});

/**
 * Obtém as rotas de todos os módulos
 * @returns {Object} Objeto com as rotas de todos os módulos
 */
function getModuleRoutes() {
  const routes = {};
  
  Object.entries(modules).forEach(([moduleName, module]) => {
    if (module.routes) {
      routes[moduleName] = module.routes;
    }
  });
  
  return routes;
}

/**
 * Inicializa os serviços dos módulos
 * @param {Object} app - Instância do Express
 */
async function initializeModules(app) {
  try {
    // Inicializa cada módulo
    for (const [moduleName, module] of Object.entries(modules)) {
      if (typeof module.initialize === 'function') {
        console.log(`🔧 Inicializando módulo: ${moduleName}`);
        await module.initialize(app);
      }
    }
    
    console.log('✅ Todos os módulos foram inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar os módulos:', error);
    throw error;
  }
}

module.exports = {
  modules,
  getModuleRoutes,
  initializeModules
};
