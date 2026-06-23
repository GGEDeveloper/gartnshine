/**
 * Configuração dos Módulos
 * 
 * Este arquivo gerencia o carregamento e configuração de todos os módulos do sistema.
 */

const path = require('path');
const fs = require('fs');

// Lista de módulos ativos
const activeModules = [

  'clients',
  'suppliers',
  'products',
  'inventory',
  'ecommerce',
  'payments',
  'financial',
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
  
  console.log('\n🔍 Procurando rotas nos módulos...');
  
  Object.entries(modules).forEach(([moduleName, module]) => {
    console.log(`\n📦 Módulo: ${moduleName}`);
    console.log('Tem propriedade routes?', !!module.routes);
    
    if (module.routes) {
      console.log(`✅ Adicionando rotas para o módulo: ${moduleName}`);
      routes[moduleName] = module.routes;
      console.log('Tipo das rotas:', typeof module.routes);
      console.log('Métodos disponíveis:', Object.keys(module.routes));
      if (module.routes.stack) {
        if (module.routes.stack.length === 0) {
          console.warn(`⚠️  O router do módulo ${moduleName} está vazio (sem handlers). Verifique se as rotas estão realmente registradas.`);
        } else {
          console.log(`Stack de rotas do módulo ${moduleName}:`, module.routes.stack.map(r => r.route && r.route.path).filter(Boolean));
        }
      }
    } else {
      console.warn(`⚠️  Módulo ${moduleName} não tem rotas exportadas. Certifique-se de exportar um router válido na propriedade 'routes'.`);
    }
  });
  
  console.log('\n📊 Rotas carregadas:', Object.keys(routes).join(', '));
  return routes;
}

/**
 * Inicializa os serviços dos módulos
 * @param {Object} app - Instância do Express
 */
function initializeModules(app) {
  try {
    for (const [moduleName, module] of Object.entries(modules)) {
      if (typeof module.initialize === 'function') {
        console.log(`🔧 Inicializando módulo: ${moduleName}`);
        module.initialize(app);
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
