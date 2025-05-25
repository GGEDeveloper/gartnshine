/**
 * Módulo de Clientes
 * 
 * Este módulo gerencia o cadastro e informações dos clientes.
 */

const express = require('express');
const router = express.Router();

// Rota mínima para healthcheck
router.get('/health', (req, res) => res.json({status: 'ok', module: 'clients'}));

// Exporta as rotas
module.exports = {
  routes: router,
  // Adicione aqui outros componentes que precisam ser exportados
};
