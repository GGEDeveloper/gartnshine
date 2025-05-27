/**
 * Módulo de stock
 * 
 * Este módulo gerencia o controle de stock de produtos.
 */

const express = require('express');
const router = express.Router();

// Importa o controlador de inventário
const inventoryController = require('./controllers/inventoryController');

// Rotas da API de inventário
router.get('/movements', inventoryController.listMovements);
router.post('/entry', inventoryController.registerEntry);
router.post('/out', inventoryController.registerOut);
router.post('/adjust', inventoryController.adjustStock);
router.get('/balance/:productId', inventoryController.getBalance);

// Exporta as rotas
module.exports = {
  routes: router,
  // Adicione aqui outros componentes que precisam ser exportados
};
