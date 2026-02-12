const BaseController = require('./BaseController');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const Inventory = require('../models/Inventory');

class InventoryController extends BaseController {
  constructor() {
    super({}); // Pass an empty object or a relevant model if BaseController expects one
    this.Product = Product;
    this.ProductFamily = ProductFamily;
    this.Inventory = Inventory; // Assuming Inventory model is used for movements
  }

  // Validação para movimentações de stock
  static validateMovement() {
    return [
      body('product_id').isInt().withMessage('Product ID must be an integer'),
      body('quantity').isInt().withMessage('Quantity must be an integer'),
      body('movement_type').isIn(['in', 'out']).withMessage('Invalid movement type'),
      body('reference').optional().isString().withMessage('Reference must be a string'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      body('unit_cost').optional().isFloat({ min: 0 }).withMessage('Unit cost must be a positive number'),
      body('supplier_id').optional().isInt().withMessage('Supplier ID must be an integer')
    ];
  }

  async index(req, res) {
    console.log('--- InventoryController.index ---');
    console.log('Raw req.query:', JSON.stringify(req.query, null, 2)); // Log detalhado do req.query

    console.log('>>> InventoryController.index called - Path:', req.path, 'User:', req.user ? req.user.id : 'No user');
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const filterOptions = {
        reference: req.query.reference,
        categoryName: req.query.category, // Matches Product.js model
        status: req.query.status,         // Matches Product.js model
        stock_status: req.query.stock_status // Matches Product.js model
      };
      console.log('Constructed filterOptions:', JSON.stringify(filterOptions, null, 2)); // Log detalhado das filterOptions
      
      const { products, totalProducts } = await this.Product.getAllWithStock({
        limit,
        offset,
        ...filterOptions
      });

      const families = await this.ProductFamily.getAll();
      const totalPages = Math.ceil(totalProducts / limit);

      res.render('admin/inventory/index', {
        layout: 'admin/layouts/main',
        title: 'Inventory Management',
        products,
        productFamilies: families,
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
        currentPath: req.path,
        user: req.user,
        breadcrumbs: res.locals.breadcrumb,
        queryParams: req.query, // Pass full query for sticky filters
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
      });
    } catch (error) {
      console.error('Error loading inventory page:', error);
      this.error(res, 'Failed to load inventory page. ' + error.message);
    }
  }

  // Show history for a specific product
  async showProductHistory(req, res) {
    console.log('>>> InventoryController.showProductHistory called - Product ID:', req.params.productId);
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return this.error(res, 'Invalid Product ID.', 400);
      }

      const product = await this.Product.findById(productId);
      if (!product) {
        return this.error(res, 'Product not found.', 404);
      }

      const history = await this.Inventory.getProductHistory(productId);
      
      res.render('admin/inventory/history', {
        layout: 'admin/layouts/main',
        title: `Histórico: ${product.name}`,
        product,
        history,
        currentPath: req.path,
        user: req.user,
        breadcrumbs: res.locals.breadcrumb,
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
      });
    } catch (error) {
      console.error('Error fetching product inventory history:', error);
      this.error(res, 'Failed to fetch product history. ' + error.message);
    }
  }

  // Process stock adjustment
  async processAdjustment(req, res) {
    console.log('>>> InventoryController.processAdjustment called - Body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return this.error(res, 'Validation failed for stock adjustment.', 400, errors);
    }

    try {
      const { product_id, quantity, movement_type, reference, notes, unit_cost, supplier_id } = req.body;
      
      const movementData = {
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        movement_type,
        reference,
        notes,
        unit_cost: unit_cost ? parseFloat(unit_cost) : null,
        supplier_id: supplier_id ? parseInt(supplier_id) : null,
        user_id: req.user ? req.user.id : null // Assuming user ID is available in req.user
      };

      await this.Inventory.createMovement(movementData);
      
      return this.success(res, null, 200, 'Stock adjusted successfully.');
    } catch (error) {
      console.error('Error processing stock adjustment:', error);
      return this.error(res, 'Failed to process stock adjustment. ' + error.message);
    }
  }

  // Obter stock atual de um produto
  async getCurrentStock(req, res) {
    try {
      const { productId } = req.params;
      const stock = await this.Inventory.getCurrentStock(productId);
      return this.success(res, stock);
    } catch (error) {
      console.error('Error getting current stock:', error);
      return this.error(res, 'Failed to fetch current stock', 500);
    }
  }

  // Obter produtos com stock baixo
  async getLowStockProducts(req, res) {
    try {
      const { threshold = 10 } = req.query;
      const products = await this.Inventory.getLowStockProducts(parseInt(threshold));
      return this.success(res, products);
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return this.error(res, 'Failed to fetch low stock products', 500);
    }
  }

  // Obter valor total do stock
  async getInventoryValue(req, res) {
    try {
      const value = await this.Inventory.calculateInventoryValue();
      return this.success(res, { total_value: value });
    } catch (error) {
      console.error('Error calculating inventory value:', error);
      return this.error(res, 'Failed to calculate inventory value', 500);
    }
  }

  // Métodos auxiliares
  error(res, message, status = 500, errors = null) {
    // If req is not available in this context, remove req.accepts and req.flash
    console.error('Controller Error:', message, 'Status:', status, 'Errors:', errors ? JSON.stringify(errors.array ? errors.array() : errors) : 'N/A');
    if (res.headersSent) return;
    
    // Simplified error handling if req is not available
    return res.status(status).json({
        success: false,
        message,
        errors: errors ? (errors.array ? errors.array() : errors) : undefined
    });
  }

  success(res, data, status = 200, message = null) {
    // If req is not available in this context, remove req.accepts and req.flash
    if (res.headersSent) return;

    // Simplified success handling if req is not available
    return res.status(status).json({
        success: true,
        data,
        message
    });
  }
}

module.exports = new InventoryController();