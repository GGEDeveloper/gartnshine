const { pool } = require('../config/database');
const BaseModel = require('./BaseModel');

class Product extends BaseModel {
  constructor() {
    super();
    this.tableName = 'products';
    this.primaryKey = 'id';
  }
  
  // Adicionando o pool como propriedade estática da classe
  static get pool() {
    return pool;
  }
  // Get all products with family information
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name 
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        ORDER BY p.reference
      `);
      return rows;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  // Get active products for the catalog
  static async getActive() {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name 
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.is_active = 1
        ORDER BY p.featured DESC, p.reference
      `);
      return rows;
    } catch (error) {
      console.error('Error getting active products:', error);
      throw error;
    }
  }

  // Get featured products
  static async getFeatured() {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name 
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.featured = 1 AND p.is_active = 1
        ORDER BY p.reference
      `);
      return rows;
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  }

  // Get products by family
  static async getByFamily(familyId) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name 
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.family_id = ? AND p.is_active = 1
        ORDER BY p.reference
      `, [familyId]);
      return rows;
    } catch (error) {
      console.error('Error getting products by family:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name 
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      // Get product images
      const [images] = await pool.query(`
        SELECT * FROM product_images
        WHERE product_id = ?
        ORDER BY is_primary DESC, sort_order
      `, [id]);
      
      rows[0].images = images;
      
      return rows[0];
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }

  // Create a new product
  static async create(product) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.query(`
        INSERT INTO products 
        (reference, family_id, name, description, sale_price, purchase_price, 
        current_stock, image_filename, style, material, weight, dimensions, 
        is_active, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.reference,
        product.family_id,
        product.name,
        product.description,
        product.sale_price,
        product.purchase_price,
        product.current_stock || 0,
        product.image_filename,
        product.style,
        product.material,
        product.weight,
        product.dimensions,
        product.is_active ? 1 : 0,
        product.featured ? 1 : 0
      ]);
      
      const productId = result.insertId;
      
      // Add inventory transaction for initial stock
      if (product.current_stock > 0) {
        await connection.query(`
          INSERT INTO inventory_transactions
          (product_id, transaction_type, quantity, unit_price, total_amount, notes)
          VALUES (?, 'purchase', ?, ?, ?, ?)
        `, [
          productId,
          product.current_stock,
          product.purchase_price,
          product.current_stock * product.purchase_price,
          'Initial stock'
        ]);
      }
      
      await connection.commit();
      return productId;
    } catch (error) {
      await connection.rollback();
      console.error('Error creating product:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update a product
  static async update(id, product) {
    try {
      const [result] = await pool.query(`
        UPDATE products SET
        reference = ?,
        family_id = ?,
        name = ?,
        description = ?,
        sale_price = ?,
        purchase_price = ?,
        current_stock = ?,
        image_filename = ?,
        style = ?,
        material = ?,
        weight = ?,
        dimensions = ?,
        is_active = ?,
        featured = ?
        WHERE id = ?
      `, [
        product.reference,
        product.family_id,
        product.name,
        product.description,
        product.sale_price,
        product.purchase_price,
        product.current_stock,
        product.image_filename,
        product.style,
        product.material,
        product.weight,
        product.dimensions,
        product.is_active ? 1 : 0,
        product.featured ? 1 : 0,
        id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete a product
  static async delete(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete product images
      await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      
      // Delete inventory transactions
      await connection.query('DELETE FROM inventory_transactions WHERE product_id = ?', [id]);
      
      // Delete the product
      await connection.query('DELETE FROM products WHERE id = ?', [id]);
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting product:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Add inventory transaction
  static async addInventoryTransaction(transaction) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert the transaction
      const [result] = await connection.query(`
        INSERT INTO inventory_transactions
        (product_id, transaction_type, quantity, unit_price, total_amount, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        transaction.product_id,
        transaction.transaction_type,
        transaction.quantity,
        transaction.unit_price,
        transaction.total_amount,
        transaction.notes,
        transaction.created_by
      ]);
      
      // Update product stock
      let stockChange = transaction.quantity;
      if (transaction.transaction_type === 'sale') {
        stockChange = -stockChange;
        
        // Also update total_sold
        await connection.query(`
          UPDATE products 
          SET total_sold = total_sold + ? 
          WHERE id = ?
        `, [transaction.quantity, transaction.product_id]);
      }
      
      await connection.query(`
        UPDATE products 
        SET current_stock = current_stock + ? 
        WHERE id = ?
      `, [stockChange, transaction.product_id]);
      
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      console.error('Error adding inventory transaction:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get inventory transactions for a product
  static async getInventoryTransactions(productId) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM inventory_transactions
        WHERE product_id = ?
        ORDER BY transaction_date DESC
      `, [productId]);
      return rows;
    } catch (error) {
      console.error('Error getting inventory transactions:', error);
      throw error;
    }
  }

  // Obter produto por ID com detalhes adicionais
  static async getByIdWithDetails(id) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name,
               (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
        FROM products p
        LEFT JOIN product_families f ON p.family_id = f.id
        WHERE p.id = ?
      `, [id]);
      
      if (rows.length === 0) return null;
      
      const product = rows[0];
      
      // Carregar imagens do produto
      const [images] = await pool.query(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id', 
        [id]
      );
      
      // Carregar transações de estoque
      const [transactions] = await pool.query(
        `SELECT it.*, p.name as product_name 
         FROM inventory_transactions it
         JOIN products p ON it.product_id = p.id
         WHERE it.product_id = ?
         ORDER BY it.created_at DESC
         LIMIT 50`,
        [id]
      );
      
      return {
        ...product,
        images,
        transactions
      };
    } catch (error) {
      console.error('Error getting product with details:', error);
      throw error;
    }
  }

  // Obter todos os produtos com informações de estoque
  static async getAllWithStock() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.*, 
          f.name as family_name,
          (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count,
          COALESCE(
            (SELECT SUM(quantity) 
             FROM inventory_transactions 
             WHERE product_id = p.id 
             AND transaction_type = 'in'), 0
          ) - COALESCE(
            (SELECT SUM(quantity) 
             FROM inventory_transactions 
             WHERE product_id = p.id 
             AND transaction_type = 'out'), 0
          ) as current_stock
        FROM products p
        LEFT JOIN product_families f ON p.family_id = f.id
        ORDER BY p.reference
      `);
      
      // Converter valores numéricos
      return rows.map(row => ({
        ...row,
        current_stock: parseFloat(row.current_stock) || 0,
        sale_price: parseFloat(row.sale_price) || 0,
        purchase_price: parseFloat(row.purchase_price) || 0,
        weight: parseFloat(row.weight) || 0
      }));
    } catch (error) {
      console.error('Error getting products with stock:', error);
      throw error;
    }
  }

  // Atualizar o estoque de um produto
  static async updateStock(productId, quantityChange, unitPrice = null) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Atualizar o preço de compra se fornecido
      if (unitPrice !== null) {
        await connection.query(
          'UPDATE products SET purchase_price = ? WHERE id = ?',
          [unitPrice, productId]
        );
        
        // Registrar histórico de preço
        await this.recordPriceHistory(connection, productId, unitPrice);
      }
      
      // Atualizar o estoque
      await connection.query(
        'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
        [quantityChange, productId]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error updating product stock:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Registrar histórico de preço
  static async recordPriceHistory(connection, productId, price) {
    try {
      // Verificar se já existe um registro de preço recente (últimos 7 dias)
      const [existing] = await connection.query(
        'SELECT id FROM product_price_history WHERE product_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY created_at DESC LIMIT 1',
        [productId]
      );
      
      // Se não houver registro recente ou o preço for diferente, registrar
      if (existing.length === 0 || 
          (existing[0].price !== price && existing[0].price !== parseFloat(price))) {
        await connection.query(
          'INSERT INTO product_price_history (product_id, price) VALUES (?, ?)',
          [productId, price]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error recording price history:', error);
      // Não interromper o fluxo principal em caso de falha no histórico
      return false;
    }
  }
  
  // Obter histórico de preços de um produto
  static async getPriceHistory(productId, limit = 30) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM product_price_history WHERE product_id = ? ORDER BY created_at DESC LIMIT ?',
        [productId, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error getting price history:', error);
      return [];
    }
  }
}

module.exports = Product; 