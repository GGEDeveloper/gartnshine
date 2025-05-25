/**
 * Módulo de Vendas
 * 
 * Este módulo gerencia as vendas e pedidos.
 */

const express = require('express');
const router = express.Router();

// Rota mínima para healthcheck
router.get('/health', (req, res) => res.json({status: 'ok', module: 'sales'}));

// Exporta as rotas
module.exports = {
  routes: router,
  // Adicione aqui outros componentes que precisam ser exportados
};
