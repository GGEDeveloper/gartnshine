const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const { isAuthenticated } = require('../middleware/auth');
const {
  parseSelectedFamilyIds,
  parseMultiParam,
  normalizeFacetKeys,
  normalizePerPage
} = require('../utils/catalogFilterUtils');
const { runCatalogQuery } = require('../services/catalogQueryService');

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

// Test endpoint for debugging
router.get('/test-db', async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    res.json({ success: true, active_products: rows[0].count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search endpoint - REWRITTEN
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    const limit = parseInt(req.query.limit) || 8;
    
    // Return empty array for short queries
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    
    const db = require('../config/database');
    const searchPattern = `%${q.trim()}%`;
    
    const sql = 'SELECT id, reference, name, sale_price, current_stock FROM products WHERE is_active = 1 AND (name LIKE ? OR reference LIKE ?) ORDER BY featured DESC LIMIT ?';
    const [rows] = await db.pool.query(sql, [searchPattern, searchPattern, limit]);
    
    const results = rows.map(p => ({
      id: p.id,
      name: p.name,
      reference: p.reference,
      price_formatted: `€${parseFloat(p.sale_price || 0).toFixed(2)}`,
      image_url: '/images/imagem-nao-disponivel.svg',
      url: `/catalog/product/${p.id}`,
      in_stock: p.current_stock > 0
    }));
    
    return res.json(results);
    
  } catch (err) {
    console.error('Search error:', err.message);
    return res.status(500).json({ error: 'Search failed' });
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

// Catalog API endpoints (public)
// Filter products endpoint
router.get('/catalog/filter', async (req, res) => {
  try {
    const { families, price_range, search, sort: sortParam } = req.query;

    const hideOutOfStock = !!(res.locals.siteSettings && res.locals.siteSettings.hide_out_of_stock);
    const flatFamilies = await ProductFamily.getAll();
    const selectedFamilyIds = parseSelectedFamilyIds(families);
    const expandedFamilyIds =
      selectedFamilyIds.length > 0
        ? ProductFamily.getFamilyIdsWithDescendants(flatFamilies, selectedFamilyIds)
        : [];

    const colorsNormalized = normalizeFacetKeys(parseMultiParam(req.query, 'colors'));
    const materialsNormalized = normalizeFacetKeys(parseMultiParam(req.query, 'materials'));
    const stylesNormalized = normalizeFacetKeys(parseMultiParam(req.query, 'styles'));

    const sortType =
      sortParam && String(sortParam).trim() ? String(sortParam).trim() : 'default';
    const perPage = normalizePerPage(req.query.per_page);

    const result = await runCatalogQuery({
      hideOutOfStock,
      expandedFamilyIds,
      price_range,
      search,
      colorsNormalized,
      materialsNormalized,
      stylesNormalized,
      sortType,
      page: req.query.page,
      perPage
    });

    const filterCounts = { families: result.facets.families || {} };

    res.json({
      success: true,
      products: result.products,
      count: result.count,
      page: result.page,
      per_page: result.perPage,
      total_pages: result.total_pages,
      filterCounts,
      facets: result.facets,
      hasMore: result.page < result.total_pages
    });
  } catch (error) {
    console.error('Catalog filter API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter products',
      products: [],
      count: 0,
      page: 1,
      per_page: 24,
      total_pages: 1,
      facets: { families: {}, colors: {}, materials: {}, styles: {} }
    });
  }
});

// Get single product for quick view
router.get('/catalog/product/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await Product.getById(productId);
    
    if (!product || !product.is_active) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Format prices
    const formattedProduct = {
      ...product,
      formatted_sale_price: product.sale_price ? 
        new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.sale_price)) :
        null,
      formatted_purchase_price: product.purchase_price ?
        new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.purchase_price)) :
        null
    };
    
    res.json({
      success: true,
      ...formattedProduct
    });
    
  } catch (error) {
    console.error('Catalog product API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get product' 
    });
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