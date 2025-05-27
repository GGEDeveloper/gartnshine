const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');

// Listar movimentações de stock
router.get('/movements', InventoryController.listMovements);
// Registrar entrada de stock
router.post('/entry', InventoryController.registerEntry);
// Registrar saída de stock
router.post('/out', InventoryController.registerOut);
// Ajustar stock
router.post('/adjust', InventoryController.adjustStock);
// Obter saldo atual de um produto
router.get('/balance/:productId', InventoryController.getBalance);

module.exports = router;
