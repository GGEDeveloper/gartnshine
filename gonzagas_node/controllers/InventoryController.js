const BaseController = require('./BaseController');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

class InventoryController extends BaseController {
  constructor() {
    super({});
    this.Product = Product;
    this.Inventory = Inventory;
  }

  // Validação para movimentações de estoque
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

  // Registrar entrada de estoque
  async stockIn(req, res) {
    try {
      // Validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return this.error(res, 'Validation failed', 400, errors);
      }

      const movement = {
        ...req.body,
        movement_type: 'in', // Forçar tipo de movimento como entrada
        user_id: req.user.id // ID do usuário autenticado
      };

      // Registrar movimento
      const result = await this.model.createMovement(movement);
      
      // Atualizar estoque atual
      await this.model.updateStock(
        movement.product_id, 
        movement.quantity, 
        'in',
        movement.unit_cost
      );

      return this.success(res, result, 201);
    } catch (error) {
      console.error('Error in stock in:', error);
      return this.error(res, 'Failed to register stock in', 500);
    }
  }

  // Listar produtos com estoque
  async index(req, res) {
    try {
      const products = await this.Product.getAllWithStock();
      
      res.render('admin/inventory/index', {
        title: 'Gerenciamento de Estoque',
        products
      });
    } catch (error) {
      console.error('Error loading inventory:', error);
      req.flash('error_msg', 'Erro ao carregar o estoque');
      res.redirect('/admin/dashboard');
    }
  }

  // Exibir histórico de um produto
  async showProductHistory(req, res) {
    try {
      const productId = parseInt(req.params.productId);
      const product = await this.Product.getByIdWithDetails(productId);
      
      if (!product) {
        req.flash('error_msg', 'Produto não encontrado');
        return res.redirect('/admin/inventory');
      }
      
      const transactions = await this.Inventory.getProductTransactions(productId);
      
      res.render('admin/inventory/product', {
        title: `Histórico - ${product.name}`,
        product,
        transactions
      });
    } catch (error) {
      console.error('Error loading product history:', error);
      req.flash('error_msg', 'Erro ao carregar o histórico do produto');
      res.redirect('/admin/inventory');
    }
  }

  // Listar todas as transações
  async listTransactions(req, res) {
    try {
      const { product_id, type, date } = req.query;
      
      const filter = {};
      if (product_id) filter.product_id = product_id;
      if (type) filter.transaction_type = type;
      if (date) filter.date = date;
      
      const transactions = await this.Inventory.getAllTransactions(filter);
      const products = await this.Product.getAll();
      
      res.render('admin/inventory/transactions', {
        title: 'Histórico de Transações',
        transactions,
        products,
        filters: { product_id, type, date }
      });
    } catch (error) {
      console.error('Error loading transactions:', error);
      req.flash('error_msg', 'Erro ao carregar as transações');
      res.redirect('/admin/inventory');
    }
  }

  // Processar ajuste de estoque
  async processAdjustment(req, res) {
    try {
      const { product_id, transaction_type, quantity, unit_price, notes } = req.body;
      const user_id = req.user.id;
      
      // Validação
      if (!['in', 'out', 'adjustment'].includes(transaction_type)) {
        req.flash('error_msg', 'Tipo de transação inválido');
        return res.redirect('back');
      }
      
      if (isNaN(quantity) || quantity < 0) {
        req.flash('error_msg', 'Quantidade inválida');
        return res.redirect('back');
      }
      
      // Obter produto
      const product = await this.Product.getById(product_id);
      if (!product) {
        req.flash('error_msg', 'Produto não encontrado');
        return res.redirect('/admin/inventory');
      }
      
      // Preparar dados da transação
      const transactionData = {
        product_id: parseInt(product_id),
        transaction_type,
        quantity: parseFloat(quantity),
        unit_price: parseFloat(unit_price) || 0,
        total_amount: parseFloat(quantity) * (parseFloat(unit_price) || 0),
        notes: notes || '',
        created_by: req.user.username || 'Sistema',
        user_id
      };
      
      // Processar ajuste
      if (transaction_type === 'adjustment') {
        const currentStock = product.current_stock || 0;
        const adjustment = parseFloat(quantity) - currentStock;
        
        if (adjustment > 0) {
          // Entrada
          transactionData.transaction_type = 'in';
          transactionData.quantity = adjustment;
          transactionData.notes = `Ajuste de estoque (definir para ${quantity}): ${notes || ''}`.trim();
        } else if (adjustment < 0) {
          // Saída
          transactionData.transaction_type = 'out';
          transactionData.quantity = Math.abs(adjustment);
          transactionData.notes = `Ajuste de estoque (definir para ${quantity}): ${notes || ''}`.trim();
        } else {
          // Sem alteração na quantidade, apenas registro
          req.flash('info_msg', 'Nenhuma alteração no estoque necessária');
          return res.redirect(`/admin/inventory/${product_id}`);
        }
      }
      
      // Registrar transação
      await this.Inventory.create(transactionData);
      
      // Atualizar estoque do produto
      const stockChange = transactionData.transaction_type === 'in' 
        ? transactionData.quantity 
        : -transactionData.quantity;
      
      await this.Product.updateStock(
        product_id, 
        stockChange, 
        transactionData.unit_price
      );
      
      req.flash('success_msg', 'Estoque atualizado com sucesso');
      res.redirect(`/admin/inventory/${product_id}`);
      
    } catch (error) {
      console.error('Error processing inventory adjustment:', error);
      req.flash('error_msg', 'Erro ao processar o ajuste de estoque');
      res.redirect('back');
    }
  }

  // Ajuste de estoque
  async adjustStock(req, res) {
    try {
      const { product_id, new_quantity, reason } = req.body;
      
      // Validação básica
      if (!product_id || new_quantity === undefined) {
        return this.error(res, 'Product ID and new quantity are required', 400);
      }

      // Obter estoque atual
      const currentStock = await this.model.getCurrentStock(product_id);
      const difference = new_quantity - currentStock;

      if (difference === 0) {
        return this.success(res, { message: 'No stock adjustment needed' });
      }

      // Criar movimento de ajuste
      const movement = {
        product_id,
        quantity: Math.abs(difference),
        movement_type: difference > 0 ? 'in' : 'out',
        reference: 'STOCK_ADJUST',
        notes: reason || 'Stock adjustment',
        user_id: req.user.id
      };

      // Registrar movimento
      await this.model.createMovement(movement);
      
      // Atualizar estoque
      await this.model.updateStock(
        product_id, 
        Math.abs(difference), 
        difference > 0 ? 'in' : 'out'
      );

      return this.success(res, { 
        message: 'Stock adjusted successfully',
        previous_quantity: currentStock,
        new_quantity,
        difference
      });
    } catch (error) {
      console.error('Error adjusting stock:', error);
      return this.error(res, 'Failed to adjust stock', 500);
    }
  }

  // Obter histórico de movimentações
  async getMovementHistory(req, res) {
    try {
      const { product_id, start_date, end_date, movement_type, limit = 50, page = 1 } = req.query;
      
      const filters = {
        product_id: product_id ? parseInt(product_id) : null,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        movement_type: movement_type || null,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const { movements, total } = await this.model.getMovementHistory(filters);
      
      return this.success(res, {
        data: movements,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error getting movement history:', error);
      return this.error(res, 'Failed to fetch movement history', 500);
    }
  }

  // Obter relatório de estoque atual
  async getCurrentStock(req, res) {
    try {
      const { low_stock_threshold = 10, category_id, supplier_id } = req.query;
      
      const filters = {
        low_stock_threshold: parseInt(low_stock_threshold),
        category_id: category_id ? parseInt(category_id) : null,
        supplier_id: supplier_id ? parseInt(supplier_id) : null
      };

      const stock = await this.model.getCurrentStockReport(filters);
      
      return this.success(res, stock);
    } catch (error) {
      console.error('Error getting current stock:', error);
      return this.error(res, 'Failed to fetch current stock', 500);
    }
  }

  // Obter produtos com estoque baixo
  async getLowStockProducts(req, res) {
    try {
      const { threshold = 10 } = req.query;
      const products = await this.model.getLowStockProducts(parseInt(threshold));
      return this.success(res, products);
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return this.error(res, 'Failed to fetch low stock products', 500);
    }
  }

  // Obter valor total do estoque
  async getInventoryValue(req, res) {
    try {
      const value = await this.model.calculateInventoryValue();
      return this.success(res, { total_value: value });
    } catch (error) {
      console.error('Error calculating inventory value:', error);
      return this.error(res, 'Failed to calculate inventory value', 500);
    }
  }
}

// Métodos auxiliares
InventoryController.prototype.error = function(res, message, status = 500, errors = null) {
  if (res.headersSent) return;
  
  if (res.req.accepts('html')) {
    // Se for uma requisição de navegador, redirecionar com mensagem de erro
    const flash = res.req.flash || (() => {});
    flash('error_msg', message);
    return res.redirect('back');
  } else {
    // Se for uma API, retornar JSON
    return res.status(status).json({
      success: false,
      message,
      errors: errors ? errors.array() : undefined
    });
  }
};

InventoryController.prototype.success = function(res, data, status = 200, message = null) {
  if (res.headersSent) return;
  
  if (res.req.accepts('html')) {
    // Se for uma requisição de navegador, redirecionar com mensagem de sucesso
    const flash = res.req.flash || (() => {});
    if (message) flash('success_msg', message);
    return res.redirect('back');
  } else {
    // Se for uma API, retornar JSON
    return res.status(status).json({
      success: true,
      data,
      message
    });
  }
};

module.exports = new InventoryController();
