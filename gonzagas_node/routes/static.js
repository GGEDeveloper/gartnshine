const express = require('express');
const router = express.Router();
const path = require('path');

// Rota para o favicon.ico
router.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // Retorna 204 No Content
});

// Imagens em /images/* são servidas por express.static('public') em app.js.
// Não interceptar aqui — uma rota 404 bloqueava placeholder e todos os ficheiros em public/images.

module.exports = router;
