const path = require('path');
const fs = require('fs');

// Carrega a configuração do módulo
const moduleConfig = require('../module-config.json').modules.products;

// Função para renderizar o componente
function renderComponent(componentName, options = {}) {
  const componentPath = path.join(__dirname, 'components', componentName + '.ejs');
  
  // Verifica se o componente existe
  if (!fs.existsSync(componentPath)) {
    throw new Error(`Componente não encontrado: ${componentPath}`);
  }

  // Retorna uma função que pode ser chamada pelo Express
  return function(req, res, next) {
    // Adiciona dados padrão
    const data = {
      ...options,
      moduleConfig,
      currentPath: req.path,
      query: req.query,
      user: req.user || {},
      componentPath: `modules/products/components/${componentName}`
    };

    // Renderiza o componente dentro do layout base
    res.render('modules/base-module', data, (err, html) => {
      if (err) return next(err);
      res.send(html);
    });
  };
}

// Exporta as rotas do módulo
module.exports = function(router) {
  // Lista de produtos
  router.get('/', renderComponent('list'));
  
  // Novo produto
  router.get('/new', renderComponent('form', { 
    pageTitle: 'Novo Produto',
    backButton: { url: '/admin/products' }
  }));
  
  // Visualizar produto
  router.get('/:id', renderComponent('view', {
    pageTitle: 'Detalhes do Produto',
    backButton: { url: '/admin/products' }
  }));
  
  // Editar produto
  router.get('/:id/edit', renderComponent('form', {
    pageTitle: 'Editar Produto',
    backButton: { url: '/admin/products' },
    isEdit: true
  }));

  return router;
};
