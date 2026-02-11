const { pool } = require('../config/database');

class ProductFamily {
  // Adicionando o pool como propriedade estática da classe
  static pool = pool;
  // Get all product families
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM product_families
        ORDER BY name
      `);
      return rows;
    } catch (error) {
      console.error('Error getting product families:', error);
      throw error;
    }
  }

  // Get product family by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM product_families
        WHERE id = ?
      `, [id]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error getting product family by ID:', error);
      throw error;
    }
  }

  // Create a new product family
  static async create(family) {
    try {
      const [result] = await pool.query(`
        INSERT INTO product_families 
        (code, name, description, parent_id)
        VALUES (?, ?, ?, ?)
      `, [
        family.code,
        family.name,
        family.description || null,
        family.parent_id ? parseInt(family.parent_id, 10) : null
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating product family:', error);
      throw error;
    }
  }

  // Update a product family
  static async update(id, family) {
    try {
      const [result] = await pool.query(`
        UPDATE product_families SET
        code = ?,
        name = ?,
        description = ?,
        parent_id = ?
        WHERE id = ?
      `, [
        family.code,
        family.name,
        family.description || null,
        family.parent_id ? parseInt(family.parent_id, 10) : null,
        id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product family:', error);
      throw error;
    }
  }

  // Delete a product family
  static async delete(id) {
    try {
      // First check if there are products using this family
      const [products] = await pool.query(
        'SELECT COUNT(*) as count FROM products WHERE family_id = ?',
        [id]
      );
      
      if (products[0].count > 0) {
        throw new Error(`Cannot delete family with ID ${id} because it is being used by ${products[0].count} products`);
      }
      
      const [result] = await pool.query('DELETE FROM product_families WHERE id = ?', [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting product family:', error);
      throw error;
    }
  }

  // Count all product families
  static async count() {
    try {
      const [rows] = await this.pool.query('SELECT COUNT(*) as count FROM product_families');
      return rows[0].count;
    } catch (error) {
      console.error('Error counting product families:', error);
      throw error;
    }
  }

  // Get categories with subcategories (for quick product form)
  static async getCategoriesWithSubcategories() {
    try {
      let rows;
      try {
        const [r] = await pool.query(`
          SELECT f.*, COUNT(p.id) as product_count
          FROM product_families f
          LEFT JOIN products p ON f.id = p.family_id
          WHERE f.is_active = 1
          GROUP BY f.id
          ORDER BY f.name
        `);
        rows = r;
      } catch (colErr) {
        if (colErr.code === 'ER_BAD_FIELD_ERROR' || (colErr.message && colErr.message.includes('parent_id'))) {
          const [r] = await pool.query('SELECT * FROM product_families WHERE is_active = 1 ORDER BY name');
          rows = r;
        } else throw colErr;
      }
      const hasParentId = rows.length > 0 && typeof rows[0].parent_id !== 'undefined';
      const categories = hasParentId ? rows.filter(f => !f.parent_id) : rows;
      const subcategories = hasParentId ? rows.filter(f => f.parent_id) : [];
      return { categories, subcategories };
    } catch (error) {
      console.error('Error getting categories with subcategories:', error);
      throw error;
    }
  }

  // Get all families as flat list (categories + subcategories)
  static async getAllForQuickForm() {
    try {
      const { categories, subcategories } = await this.getCategoriesWithSubcategories();
      return { categories, subcategories };
    } catch (error) {
      console.error('Error getting families for quick form:', error);
      throw error;
    }
  }

  // Get family with product count
  static async getAllWithProductCount() {
    try {
      const [rows] = await pool.query(`
        SELECT f.*, COUNT(p.id) as product_count
        FROM product_families f
        LEFT JOIN products p ON f.id = p.family_id
        GROUP BY f.id
        ORDER BY f.name
      `);
      return rows;
    } catch (error) {
      console.error('Error getting families with product count:', error);
      throw error;
    }
  }
}

module.exports = ProductFamily; 