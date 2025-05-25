/**
 * Módulo Financeiro
 * 
 * Este módulo gerencia as informações financeiras, como contas a pagar e receber.
 */

const express = require('express');
const router = express.Router();

// Rota mínima para healthcheck
router.get('/health', (req, res) => res.json({status: 'ok', module: 'financial'}));

// Exporta as rotas
module.exports = {
  routes: router,
  // Adicione aqui outros componentes que precisam ser exportados
};
