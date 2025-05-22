const { pool } = require('../config/database');
const BaseModel = require('./BaseModel');

// Adiciona o pool como propriedade estática da classe
BaseModel.pool = pool;

class Inventory extends BaseModel {
  constructor() {
    super();
    this.tableName = 'inventory_transactions';
    this.primaryKey = 'id';
  }
  
  // Adicionando o pool como propriedade estática da classe
  static get pool() {
    return pool;
  }

  /**
   * Registra uma movimentação de estoque
   */
  static async createMovement(movementData) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Inserir a transação
      const [result] = await connection.query(
        `INSERT INTO ${this.tableName} 
         (product_id, transaction_type, quantity, unit_price, total_amount, notes, created_by, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movementData.product_id,
          movementData.transaction_type,
          movementData.quantity,
          movementData.unit_price || 0,
          movementData.total_amount || (movementData.quantity * (movementData.unit_price || 0)),
          movementData.notes || null,
          movementData.created_by || 'Sistema',
          movementData.user_id || null
        ]
      );
      
      // Atualizar o estoque atual do produto
      await this.updateProductStock(
        connection,
        movementData.product_id,
        movementData.transaction_type === 'in' ? movementData.quantity : -movementData.quantity,
        movementData.unit_price || 0
      );
      
      await connection.commit();
      return result.insertId;
      
    } catch (error) {
      await connection.rollback();
      console.error('Error in Inventory createMovement:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Atualiza o estoque de um produto
   * @private
   */
  static async updateProductStock(connection, productId, quantityChange, unitPrice) {
    try {
      // Atualizar o estoque do produto
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = NOW() WHERE id = ?',
        [quantityChange, productId]
      );
      
      // Registrar no histórico de preços se o preço mudou
      if (unitPrice && unitPrice > 0) {
        await this.recordPriceHistory(connection, productId, unitPrice);
      }
      
    } catch (error) {
      console.error('Error in updateProductStock:', error);
      throw error;
    }
  }

  /**
   * Registra o histórico de preços de um produto
   * @private
   */
  static async recordPriceHistory(connection, productId, price) {
    try {
      await connection.query(
        `INSERT INTO product_price_history 
         (product_id, price, recorded_at) 
         VALUES (?, ?, NOW())`,
        [productId, price]
      );
    } catch (error) {
      console.error('Error in recordPriceHistory:', error);
      throw error;
    }
  }

  /**
   * Obtém o histórico de movimentações de estoque
   */
  static async getMovementHistory(filters = {}) {
    const { productId, startDate, endDate, transactionType, limit = 100, offset = 0 } = filters;
    
    let query = `
      SELECT it.*, p.name as product_name, p.sku
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (productId) {
      query += ' AND it.product_id = ?';
      params.push(productId);
    }
    
    if (startDate) {
      query += ' AND it.created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND it.created_at <= ?';
      params.push(endDate);
    }
    
    if (transactionType) {
      query += ' AND it.transaction_type = ?';
      params.push(transactionType);
    }
    
    query += ' ORDER BY it.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    try {
      const [rows] = await this.pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getMovementHistory:', error);
      throw error;
    }
  }

  /**
   * Obtém o relatório de estoque atual
   */
  static async getCurrentStockReport(filters = {}) {
    const { categoryId, lowStockThreshold } = filters;
    
    let query = `
      SELECT 
        p.id, 
        p.sku, 
        p.name, 
        p.description,
        p.stock_quantity as current_stock,
        p.min_stock_level,
        p.max_stock_level,
        p.purchase_price,
        p.selling_price,
        p.category_id,
        c.name as category_name,
        p.unit_of_measure,
        p.location,
        p.supplier_id,
        s.name as supplier_name,
        p.reorder_point,
        p.last_stock_update,
        p.is_active,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_active = 1
    `;
    
    const params = [];
    
    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(categoryId);
    }
    
    if (lowStockThreshold !== undefined) {
      query += ' AND p.stock_quantity <= ?';
      params.push(lowStockThreshold);
    }
    
    query += ' ORDER BY p.name';
    
    try {
      const [rows] = await this.pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getCurrentStockReport:', error);
      throw error;
    }
  }

  /**
   * Obtém produtos com estoque baixo
   */
  static async getLowStockProducts(threshold = 10) {
    try {
      const query = `
        SELECT 
          p.id, 
          p.sku, 
          p.name, 
          p.stock_quantity as current_stock,
          p.min_stock_level,
          p.reorder_point,
          p.supplier_id,
          s.name as supplier_name,
          s.email as supplier_email
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.is_active = 1 
          AND p.stock_quantity <= ?
        ORDER BY p.stock_quantity ASC`;
      
      const [rows] = await this.pool.query(query, [threshold]);
      return rows;
    } catch (error) {
      console.error('Error in getLowStockProducts:', error);
      throw error;
    }
  }

  /**
   * Calcula o valor total do estoque
   */
  static async calculateInventoryValue() {
    try {
      const query = `
        SELECT 
          SUM(stock_quantity * purchase_price) as total_value,
          COUNT(*) as product_count,
          SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_count
        FROM products
        WHERE is_active = 1`;
      
      const [rows] = await this.pool.query(query);
      return rows[0] || { total_value: 0, product_count: 0, low_stock_count: 0 };
    } catch (error) {
      console.error('Error in calculateInventoryValue:', error);
      throw error;
    }
  }

  /**
   * Ajusta o estoque de um produto
   */
  static async adjustStock(productId, newQuantity, reason, userId) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Obter a quantidade atual
      const [product] = await connection.query(
        'SELECT stock_quantity, purchase_price FROM products WHERE id = ? FOR UPDATE',
        [productId]
      );
      
      if (!product || product.length === 0) {
        throw new Error('Product not found');
      }
      
      const currentStock = product[0].stock_quantity || 0;
      const difference = newQuantity - currentStock;
      
      if (difference === 0) {
        return { adjusted: false, message: 'No adjustment needed' };
      }
      
      const transactionType = difference > 0 ? 'in' : 'out';
      const quantity = Math.abs(difference);
      
      // Registrar a transação de ajuste
      await connection.query(
        `INSERT INTO ${this.tableName} 
         (product_id, transaction_type, quantity, unit_price, notes, created_by, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          'adjustment',
          quantity,
          product[0].purchase_price || 0,
          reason || `Ajuste de estoque: ${transactionType} ${quantity} unidades`,
          userId || 'Sistema',
          userId || null
        ]
      );
      
      // Atualizar o estoque
      await connection.query(
        'UPDATE products SET stock_quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, productId]
      );
      
      await connection.commit();
      
      return {
        adjusted: true,
        product_id: productId,
        previous_quantity: currentStock,
        new_quantity: newQuantity,
        difference: difference
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error in Inventory adjustStock:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtém as transações de um produto específico
   */
  static async getProductTransactions(productId, limit = 50) {
    try {
      const [rows] = await this.pool.query(
        `SELECT * FROM ${this.tableName} 
         WHERE product_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [productId, limit]
      );
      
      return rows;
    } catch (error) {
      console.error('Error in getProductTransactions:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as transações com filtros opcionais
   */
  static async getAllTransactions(filters = {}) {
    const { 
      productId, 
      transactionType, 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0 
    } = filters;
    
    let query = `
      SELECT it.*, p.name as product_name, p.sku
      FROM ${this.tableName} it
      JOIN products p ON it.product_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (productId) {
      query += ' AND it.product_id = ?';
      params.push(productId);
    }
    
    if (transactionType) {
      query += ' AND it.transaction_type = ?';
      params.push(transactionType);
    }
    
    if (startDate) {
      query += ' AND it.created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND it.created_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY it.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    try {
      const [rows] = await this.pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getAllTransactions:', error);
      throw error;
    }
  }

  /**
   * Obtém o estoque atual de um produto
   */
  static async getCurrentStock(productId) {
    try {
      const [rows] = await this.pool.query(
        `SELECT 
            COALESCE(
              (SELECT SUM(quantity) 
               FROM inventory_transactions 
               WHERE product_id = ? 
               AND transaction_type IN ('in', 'purchase', 'return')),
              0
            ) - 
            COALESCE(
              (SELECT SUM(quantity) 
               FROM inventory_transactions 
               WHERE product_id = ? 
               AND transaction_type IN ('out', 'sale', 'adjustment')),
              0
            ) as current_stock`,
        [productId, productId]
      );
      
      return rows[0]?.current_stock || 0;
    } catch (error) {
      console.error('Error in getCurrentStock:', error);
      throw error;
    }
  }
}

module.exports = Inventory;
