const { pool } = require('../config/database');

/**
 * Coleções curadas: conjuntos de peças escolhidas à mão, independentes da
 * taxonomia de categorias (product_families). Uma peça mantém sempre a sua
 * categoria e pode entrar em várias coleções.
 *
 * Não confundir com media_collections (ficheiros de media) nem com
 * product_families (categorias que alimentam os filtros do catálogo).
 */
class Collection {
  /** Gera um slug único a partir do nome. */
  static async buildSlug(name, ignoreId = null) {
    const base = String(name || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // tira acentos (combining marks)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 170) || 'colecao';

    let slug = base;
    let n = 2;
    /* eslint-disable no-await-in-loop */
    while (true) {
      const [rows] = await pool.query(
        'SELECT id FROM collections WHERE slug = ?' + (ignoreId ? ' AND id <> ?' : ''),
        ignoreId ? [slug, ignoreId] : [slug]
      );
      if (rows.length === 0) return slug;
      slug = `${base}-${n++}`;
    }
    /* eslint-enable no-await-in-loop */
  }

  /** Coleções visíveis ao público, só as que têm peças activas. */
  static async getActiveWithCounts() {
    try {
      const [rows] = await pool.query(
        `SELECT c.id, c.name, c.slug, c.description, c.hero_image, c.card_image,
                COUNT(p.id) AS product_count,
                COUNT(DISTINCT p.family_id) AS family_count,
                -- Uma coleção pode juntar peças de várias famílias; guardamos os
                -- nomes para as mostrar sem uma segunda consulta por coleção.
                GROUP_CONCAT(DISTINCT f.name ORDER BY f.name SEPARATOR ' · ') AS family_names,
                (SELECT pi.image_filename
                   FROM collection_products cp2
                   JOIN products p2 ON p2.id = cp2.product_id AND p2.is_active = 1
                   JOIN product_images pi ON pi.product_id = p2.id
                  WHERE cp2.collection_id = c.id
                  ORDER BY cp2.sort_order ASC, pi.is_primary DESC, pi.id ASC
                  LIMIT 1) AS fallback_image
           FROM collections c
           JOIN collection_products cp ON cp.collection_id = c.id
           JOIN products p ON p.id = cp.product_id AND p.is_active = 1
           LEFT JOIN product_families f ON f.id = p.family_id
          WHERE c.is_active = 1
          GROUP BY c.id, c.name, c.slug, c.description, c.hero_image, c.card_image
          ORDER BY c.sort_order ASC, c.name ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error getting active collections:', error);
      return [];
    }
  }

  /** Todas as coleções, para o admin. */
  static async getAllForAdmin() {
    try {
      const [rows] = await pool.query(
        `SELECT c.*,
                (SELECT COUNT(*) FROM collection_products cp WHERE cp.collection_id = c.id) AS product_count
           FROM collections c
          ORDER BY c.sort_order ASC, c.name ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error getting collections for admin:', error);
      throw error;
    }
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM collections WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async getBySlug(slug) {
    const [rows] = await pool.query(
      'SELECT * FROM collections WHERE slug = ? AND is_active = 1',
      [slug]
    );
    return rows[0] || null;
  }

  /** Peças da coleção, pela ordem definida no admin. */
  static async getProducts(collectionId, { activeOnly = true } = {}) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, f.name AS family_name, cp.sort_order,
                (SELECT pi.image_filename FROM product_images pi
                  WHERE pi.product_id = p.id
                  ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
                  LIMIT 1) AS image_url
           FROM collection_products cp
           JOIN products p ON p.id = cp.product_id
           LEFT JOIN product_families f ON f.id = p.family_id
          WHERE cp.collection_id = ?
            ${activeOnly ? 'AND p.is_active = 1' : ''}
          ORDER BY cp.sort_order ASC, p.reference ASC`,
        [collectionId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting collection products:', error);
      return [];
    }
  }

  static async create({ name, description = null }) {
    const slug = await this.buildSlug(name);
    const [[{ nextOrder }]] = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextOrder FROM collections'
    );
    const [result] = await pool.query(
      'INSERT INTO collections (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
      [name, slug, description, nextOrder]
    );
    return result.insertId;
  }

  static async updateContent(id, { name, description, seoTitle, seoDescription, isActive }) {
    // O slug acompanha o nome, mas mantém-se se o nome não mudou — para não
    // quebrar links já partilhados sem necessidade.
    const current = await this.getById(id);
    const slug = current && current.name === name
      ? current.slug
      : await this.buildSlug(name, id);

    const [result] = await pool.query(
      `UPDATE collections
          SET name = ?, slug = ?, description = ?, seo_title = ?, seo_description = ?, is_active = ?
        WHERE id = ?`,
      [name, slug, description || null, seoTitle || null, seoDescription || null, isActive ? 1 : 0, id]
    );
    return result.affectedRows > 0;
  }

  static async updateImage(id, field, imagePath) {
    if (!['hero_image', 'card_image'].includes(field)) {
      throw new Error(`Campo de imagem inválido: ${field}`);
    }
    const [result] = await pool.query(
      `UPDATE collections SET ${field} = ? WHERE id = ?`,
      [imagePath, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    // collection_products cai por CASCADE; os produtos não são tocados.
    const [result] = await pool.query('DELETE FROM collections WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /** Acrescenta peças à coleção, no fim da ordem. Ignora as que já lá estão. */
  static async addProducts(collectionId, productIds) {
    if (!productIds || productIds.length === 0) return 0;

    const [[{ nextOrder }]] = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextOrder FROM collection_products WHERE collection_id = ?',
      [collectionId]
    );

    const values = productIds.map((pid, i) => [collectionId, pid, nextOrder + i]);
    const [result] = await pool.query(
      'INSERT IGNORE INTO collection_products (collection_id, product_id, sort_order) VALUES ?',
      [values]
    );
    return result.affectedRows;
  }

  static async removeProduct(collectionId, productId) {
    const [result] = await pool.query(
      'DELETE FROM collection_products WHERE collection_id = ? AND product_id = ?',
      [collectionId, productId]
    );
    return result.affectedRows > 0;
  }

  /** Troca a posição de uma peça com a vizinha acima/abaixo. */
  static async moveProduct(collectionId, productId, direction) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [[current]] = await connection.query(
        'SELECT product_id, sort_order FROM collection_products WHERE collection_id = ? AND product_id = ?',
        [collectionId, productId]
      );
      if (!current) {
        await connection.rollback();
        return false;
      }

      const cmp = direction === 'up' ? '<' : '>';
      const ord = direction === 'up' ? 'DESC' : 'ASC';
      const [[neighbour]] = await connection.query(
        `SELECT product_id, sort_order FROM collection_products
          WHERE collection_id = ?
            AND (sort_order ${cmp} ? OR (sort_order = ? AND product_id ${cmp} ?))
          ORDER BY sort_order ${ord}, product_id ${ord}
          LIMIT 1`,
        [collectionId, current.sort_order, current.sort_order, productId]
      );
      if (!neighbour) {
        await connection.rollback();
        return false; // já está no topo/fundo
      }

      // Empate de sort_order: trocar valores iguais não teria efeito.
      let currentNew = neighbour.sort_order;
      let neighbourNew = current.sort_order;
      if (neighbour.sort_order === current.sort_order) {
        currentNew = direction === 'up' ? current.sort_order - 1 : current.sort_order + 1;
        neighbourNew = current.sort_order;
      }

      await connection.query(
        'UPDATE collection_products SET sort_order = ? WHERE collection_id = ? AND product_id = ?',
        [currentNew, collectionId, current.product_id]
      );
      await connection.query(
        'UPDATE collection_products SET sort_order = ? WHERE collection_id = ? AND product_id = ?',
        [neighbourNew, collectionId, neighbour.product_id]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error moving collection product:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Peças candidatas a acrescentar: activas e ainda fora desta coleção.
   * Suporta pesquisa por nome/referência e filtro por categoria.
   */
  static async getCandidateProducts(collectionId, { q = '', familyId = null, limit = 60 } = {}) {
    const params = [collectionId];
    let where = 'p.is_active = 1 AND cp.product_id IS NULL';

    if (q) {
      where += ' AND (p.name LIKE ? OR p.reference LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (familyId) {
      where += ' AND p.family_id = ?';
      params.push(parseInt(familyId, 10));
    }
    params.push(limit);

    try {
      const [rows] = await pool.query(
        `SELECT p.id, p.name, p.reference, f.name AS family_name,
                (SELECT pi.image_filename FROM product_images pi
                  WHERE pi.product_id = p.id
                  ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) AS image_url
           FROM products p
           LEFT JOIN product_families f ON f.id = p.family_id
           LEFT JOIN collection_products cp
                  ON cp.product_id = p.id AND cp.collection_id = ?
          WHERE ${where}
          ORDER BY p.reference ASC
          LIMIT ?`,
        params
      );
      return rows;
    } catch (error) {
      console.error('Error getting candidate products:', error);
      return [];
    }
  }
}

module.exports = Collection;
