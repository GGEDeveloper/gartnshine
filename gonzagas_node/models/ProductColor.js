const { pool } = require('../config/database');

class ProductColor {
  static pool = pool;

  static async getAll() {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM product_colors ORDER BY sort_order ASC, name ASC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting product colors:', error);
      throw error;
    }
  }

  static async getActive() {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM product_colors WHERE is_active = 1 ORDER BY sort_order ASC, name ASC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting active product colors:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM product_colors WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error getting product color by ID:', error);
      throw error;
    }
  }

  static async create({ name, hex_code = null, sort_order = 0 }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO product_colors (name, hex_code, sort_order) VALUES (?, ?, ?)',
        [name.trim(), hex_code && hex_code.trim() ? hex_code.trim() : null, sort_order || 0]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating product color:', error);
      throw error;
    }
  }

  static async update(id, { name, hex_code, sort_order, is_active }) {
    try {
      const updates = [];
      const params = [];
      if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()); }
      if (hex_code !== undefined) { updates.push('hex_code = ?'); params.push(hex_code && hex_code.trim() ? hex_code.trim() : null); }
      if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order); }
      if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
      if (updates.length === 0) return false;
      params.push(id);
      const [result] = await pool.query(
        `UPDATE product_colors SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product color:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM product_colors WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting product color:', error);
      throw error;
    }
  }
}

module.exports = ProductColor;
