const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');

// Listar movimentações de estoque
router.get('/movements', InventoryController.listMovements);
// Registrar entrada de estoque
router.post('/entry', InventoryController.registerEntry);
// Registrar saída de estoque
router.post('/out', InventoryController.registerOut);
// Ajustar estoque
router.post('/adjust', InventoryController.adjustStock);
// Obter saldo atual de um produto
router.get('/balance/:productId', InventoryController.getBalance);

module.exports = router;
