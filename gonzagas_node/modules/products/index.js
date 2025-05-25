/**
 * Módulo de Produtos
 * 
 * Este módulo gerencia o catálogo de produtos, incluindo cadastro, edição, exclusão e consulta de itens.
 */

const express = require('express');
const router = express.Router();

// Importa os controladores
const ProductController = require('./controllers/ProductController');

// Rotas da API
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

// Exporta o módulo
module.exports = {
  // Rotas do módulo
  routes: router,
  
  // Inicialização do módulo (opcional)
  initialize: async (app) => {
    try {
      console.log('🔧 Módulo de produtos inicializado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar o módulo de produtos:', error);
      throw error;
    }
  },
  
  // Outros componentes que precisam ser exportados
  // ...
};
