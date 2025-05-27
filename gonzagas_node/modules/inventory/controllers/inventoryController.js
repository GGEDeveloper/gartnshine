/**
 * Controlador de Inventário
 * 
 * Gerencia as operações de movimentação de stock: entradas, saídas, ajustes e consulta de saldo.
 */

const Inventory = require('../../../models/Inventory');

const InventoryController = {
  // Listar movimentações de stock
  async listMovements(req, res) {
    try {
      const movements = await Inventory.getAllMovements(req.query);
      res.json({ success: true, data: movements });
    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar movimentações', error: error.message });
    }
  },

  // Registrar entrada de stock
  async registerEntry(req, res) {
    try {
      const entry = await Inventory.registerEntry(req.body);
      res.status(201).json({ success: true, message: 'Entrada registrada com sucesso', data: entry });
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
      res.status(500).json({ success: false, message: 'Erro ao registrar entrada', error: error.message });
    }
  },

  // Registrar saída de stock
  async registerOut(req, res) {
    try {
      const out = await Inventory.registerOut(req.body);
      res.status(201).json({ success: true, message: 'Saída registrada com sucesso', data: out });
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      res.status(500).json({ success: false, message: 'Erro ao registrar saída', error: error.message });
    }
  },

  // Ajustar stock
  async adjustStock(req, res) {
    try {
      const adjustment = await Inventory.adjustStock(req.body);
      res.status(201).json({ success: true, message: 'Ajuste realizado com sucesso', data: adjustment });
    } catch (error) {
      console.error('Erro ao ajustar stock:', error);
      res.status(500).json({ success: false, message: 'Erro ao ajustar stock', error: error.message });
    }
  },

  // Obter saldo atual de um produto
  async getBalance(req, res) {
    try {
      const productId = parseInt(req.params.productId);
      const balance = await Inventory.getBalance(productId);
      res.json({ success: true, data: balance });
    } catch (error) {
      console.error('Erro ao obter saldo:', error);
      res.status(500).json({ success: false, message: 'Erro ao obter saldo', error: error.message });
    }
  }
};

module.exports = InventoryController;
