const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const { isAuthenticated } = require('../middleware/auth');

// Public API routes
// Get featured products
router.get('/products/featured', async (req, res) => {
  try {
    const featured = await Product.getFeatured();
    res.json({ success: true, data: featured });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get featured products' });
  }
});

// Get products by family
router.get('/products/family/:familyId', async (req, res) => {
  try {
    const familyId = parseInt(req.params.familyId);
    const products = await Product.getByFamily(familyId);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get products by family' });
  }
});

// Get all product families
router.get('/families', async (req, res) => {
  try {
    const families = await ProductFamily.getAll();
    res.json({ success: true, data: families });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get product families' });
  }
});

// Search endpoint
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 8, family_id } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const { pool } = require('../config/database');
    
    let searchQuery = `
      SELECT p.id, p.reference, p.name, p.sale_price, p.current_stock,
             pi.image_filename as main_image,
             pf.name as family_name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN product_families pf ON p.family_id = pf.id
      WHERE p.is_active = 1 
      AND (p.name LIKE ? OR p.reference LIKE ? OR p.description LIKE ?)
    `;
    
    const params = [`%${q}%`, `%${q}%`, `%${q}%`];
    
    if (family_id && !isNaN(family_id)) {
      searchQuery += ` AND p.family_id = ?`;
      params.push(parseInt(family_id));
    }
    
    searchQuery += `
      ORDER BY 
        CASE 
          WHEN p.name LIKE ? THEN 1
          WHEN p.reference LIKE ? THEN 2
          ELSE 3
        END,
        p.featured DESC
      LIMIT ?
    `;
    
    params.push(`${q}%`, `${q}%`, parseInt(limit));
    
    const [results] = await pool.execute(searchQuery, params);
    
    // Format results
    const formattedResults = results.map(product => ({
      id: product.id,
      name: product.name,
      reference: product.reference,
      price_formatted: `€${parseFloat(product.sale_price || 0).toFixed(2)}`,
      family_name: product.family_name,
      image_url: product.main_image ? `/uploads/products/${product.main_image}` : '/images/placeholder.jpg',
      url: `/catalog/product/${product.id}`,
      in_stock: product.current_stock > 0
    }));
    
    res.json(formattedResults);
    
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Suggestions endpoint
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const { pool } = require('../config/database');
    
    const [suggestions] = await pool.execute(`
      SELECT DISTINCT name as suggestion
      FROM products 
      WHERE is_active = 1 
      AND name LIKE ?
      ORDER BY name
      LIMIT 5
    `, [`${q}%`]);
    
    res.json(suggestions.map(s => s.suggestion));
    
  } catch (error) {
    console.error('Suggestions API error:', error);
    res.json([]);
  }
});

// Protected API routes (require admin authentication)
router.use(isAuthenticated);

// Get all products
router.get('/admin/products', async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get products' });
  }
});

// Get product by ID
router.get('/admin/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await Product.getById(productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get product' });
  }
});

// Create product
router.post('/admin/products', async (req, res) => {
  try {
    const product = req.body;
    const productId = await Product.create(product);
    res.json({ success: true, data: { id: productId } });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// Update product
router.put('/admin/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = req.body;
    
    const success = await Product.update(productId, product);
    
    if (!success) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// Delete product
router.delete('/admin/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    await Product.delete(productId);
    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// Get inventory transactions for a product
router.get('/admin/inventory/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const transactions = await Product.getInventoryTransactions(productId);
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get inventory transactions' });
  }
});

// Add inventory transaction
router.post('/admin/inventory', async (req, res) => {
  try {
    const transaction = req.body;
    transaction.product_id = parseInt(transaction.product_id);
    transaction.quantity = parseInt(transaction.quantity);
    transaction.unit_price = parseFloat(transaction.unit_price);
    transaction.total_amount = transaction.quantity * transaction.unit_price;
    transaction.created_by = req.session.user.username;
    
    const transactionId = await Product.addInventoryTransaction(transaction);
    res.json({ success: true, data: { id: transactionId } });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add inventory transaction' });
  }
});

// Get product families with product count
router.get('/admin/families', async (req, res) => {
  try {
    const families = await ProductFamily.getAllWithProductCount();
    res.json({ success: true, data: families });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get product families' });
  }
});

// Create product family
router.post('/admin/families', async (req, res) => {
  try {
    const family = req.body;
    const familyId = await ProductFamily.create(family);
    res.json({ success: true, data: { id: familyId } });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product family' });
  }
});

// Update product family
router.put('/admin/families/:id', async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    const family = req.body;
    
    const success = await ProductFamily.update(familyId, family);
    
    if (!success) {
      return res.status(404).json({ success: false, message: 'Product family not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product family' });
  }
});

// Delete product family
router.delete('/admin/families/:id', async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    await ProductFamily.delete(familyId);
    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete product family'
    });
  }
});

module.exports = router; 