const express = require('express');
const router = express.Router();
const path = require('path');

// Rota para o favicon.ico
router.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // Retorna 204 No Content
});

// Rota para imagens estáticas
router.get('/images/:filename', (req, res) => {
  const { filename } = req.params;
  res.status(404).send('Not Found');
});

module.exports = router;
