const { pool } = require('../config/database');

/**
 * Itens curados da galeria pública (/collections). Cada linha aponta para um
 * ficheiro em public/media/gallery/ — o mesmo sítio onde as imagens de destaque
 * das definições do site e das coleções são guardadas.
 */
class GalleryItem {
  /** Itens visíveis ao público, pela ordem definida no admin. */
  static async getAllActive() {
    try {
      const [rows] = await pool.query(
        `SELECT id, filename, caption, sort_order
         FROM gallery_items
         WHERE is_active = 1
         ORDER BY sort_order ASC, id ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error getting active gallery items:', error);
      return [];
    }
  }

  /** Todos os itens (incluindo inativos) para a gestão no admin. */
  static async getAllForAdmin() {
    try {
      const [rows] = await pool.query(
        `SELECT id, filename, caption, sort_order, is_active, created_at
         FROM gallery_items
         ORDER BY sort_order ASC, id ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error getting gallery items for admin:', error);
      throw error;
    }
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM gallery_items WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /** Nomes de ficheiro já usados — para o admin só ver os que faltam adicionar. */
  static async getUsedFilenames() {
    try {
      const [rows] = await pool.query('SELECT filename FROM gallery_items');
      return rows.map((r) => r.filename);
    } catch (error) {
      console.error('Error getting used gallery filenames:', error);
      return [];
    }
  }

  /** Adiciona no fim da ordenação atual. */
  static async create({ filename, caption = null, isActive = true }) {
    const [[{ nextOrder }]] = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextOrder FROM gallery_items'
    );
    const [result] = await pool.query(
      'INSERT INTO gallery_items (filename, caption, sort_order, is_active) VALUES (?, ?, ?, ?)',
      [filename, caption, nextOrder, isActive ? 1 : 0]
    );
    return result.insertId;
  }

  static async update(id, { caption, isActive }) {
    const [result] = await pool.query(
      'UPDATE gallery_items SET caption = ?, is_active = ? WHERE id = ?',
      [caption || null, isActive ? 1 : 0, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM gallery_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Troca a posição de um item com o vizinho acima/abaixo.
   * @param {number} id
   * @param {'up'|'down'} direction
   */
  static async move(id, direction) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [[current]] = await connection.query(
        'SELECT id, sort_order FROM gallery_items WHERE id = ?',
        [id]
      );
      if (!current) {
        await connection.rollback();
        return false;
      }

      const comparator = direction === 'up' ? '<' : '>';
      const order = direction === 'up' ? 'DESC' : 'ASC';
      const [[neighbour]] = await connection.query(
        `SELECT id, sort_order FROM gallery_items
         WHERE sort_order ${comparator} ? OR (sort_order = ? AND id ${comparator} ?)
         ORDER BY sort_order ${order}, id ${order}
         LIMIT 1`,
        [current.sort_order, current.sort_order, id]
      );
      if (!neighbour) {
        await connection.rollback();
        return false; // já está no topo/fundo
      }

      // Empate de sort_order (dados legados ou edição manual): trocar os valores
      // não teria efeito, por isso força-se uma diferença de 1 na direção certa.
      let currentNewOrder = neighbour.sort_order;
      let neighbourNewOrder = current.sort_order;
      if (neighbour.sort_order === current.sort_order) {
        currentNewOrder = direction === 'up' ? current.sort_order - 1 : current.sort_order + 1;
        neighbourNewOrder = current.sort_order;
      }

      await connection.query('UPDATE gallery_items SET sort_order = ? WHERE id = ?', [
        currentNewOrder,
        current.id
      ]);
      await connection.query('UPDATE gallery_items SET sort_order = ? WHERE id = ?', [
        neighbourNewOrder,
        neighbour.id
      ]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error moving gallery item:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = GalleryItem;
