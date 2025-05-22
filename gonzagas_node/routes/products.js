const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isAuthenticated } = require('../middleware/auth');

// Lista todos os produtos
router.get('/', async (req, res) => {
  try {
    const products = await Product.getAllWithStock();
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos'
    });
  }
});

// Obtém um produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getByIdWithDetails(parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto'
    });
  }
});

module.exports = router;
