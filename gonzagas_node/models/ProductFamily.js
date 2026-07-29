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

  /**
   * Famílias para o sitemap.xml. Faz fallback sem `slug` para bases sem
   * essa coluna ainda migrada.
   */
  static async getAllForSitemap() {
    try {
      const [rows] = await pool.execute(`
        SELECT id, name, slug, updated_at
        FROM product_families
        ORDER BY updated_at DESC
      `);
      return rows;
    } catch (error) {
      if (error.message && error.message.includes("Unknown column 'slug'")) {
        const [rows] = await pool.execute(`
          SELECT id, name, updated_at
          FROM product_families
          ORDER BY updated_at DESC
        `);
        return rows;
      }
      throw error;
    }
  }

  static async getByIdOrSlug(idOrSlug) {
    try {
      const isNumeric = /^\d+$/.test(String(idOrSlug));
      const [rows] = await pool.query(
        `SELECT f.*,
                (SELECT pi.image_filename
                   FROM product_images pi
                   JOIN products p2 ON p2.id = pi.product_id
                  WHERE p2.family_id = f.id AND p2.is_active = 1
                  ORDER BY pi.is_primary DESC, p2.featured DESC, pi.id ASC
                  LIMIT 1) AS fallback_image
           FROM product_families f
          WHERE f.${isNumeric ? 'id' : 'slug'} = ?`,
        [isNumeric ? parseInt(idOrSlug) : idOrSlug]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error getting product family by ID or slug:', error);
      throw error;
    }
  }

  // Get product family by ID with product count (para saber se pode editar o código)
  static async getByIdWithProductCount(id) {
    try {
      const [rows] = await pool.query(`
        SELECT f.*, COUNT(p.id) as product_count,
               (SELECT pi.image_filename
                  FROM product_images pi
                  JOIN products p2 ON p2.id = pi.product_id
                 WHERE p2.family_id = f.id AND p2.is_active = 1
                 ORDER BY pi.is_primary DESC, p2.featured DESC, pi.id ASC
                 LIMIT 1) AS fallback_image
        FROM product_families f
        LEFT JOIN products p ON f.id = p.family_id
        WHERE f.id = ?
        GROUP BY f.id
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

  /**
   * Coleções a mostrar na secção "Explorar Coleções" da página inicial.
   * Só famílias com produtos activos (as de topo não têm produtos directos,
   * seriam links para páginas vazias). As que têm imagem de destaque definida
   * no admin aparecem primeiro, para a secção ficar visualmente completa.
   */
  static async getForHomeShowcase(limit = 6) {
    try {
      const [rows] = await pool.query(
        `SELECT f.id, f.name, f.slug, f.hero_image, f.card_image,
                COUNT(p.id) AS product_count,
                (SELECT pi.image_filename
                   FROM product_images pi
                   JOIN products p2 ON p2.id = pi.product_id
                  WHERE p2.family_id = f.id AND p2.is_active = 1
                  ORDER BY pi.is_primary DESC, p2.featured DESC, pi.id ASC
                  LIMIT 1) AS fallback_image
         FROM product_families f
         JOIN products p ON p.family_id = f.id AND p.is_active = 1
         GROUP BY f.id, f.name, f.slug, f.hero_image, f.card_image
         ORDER BY (COALESCE(f.card_image, f.hero_image) IS NULL), product_count DESC, f.name ASC
         LIMIT ?`,
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Error getting families for home showcase:', error);
      return [];
    }
  }

  /** Define (ou limpa, com null) a imagem de destaque usada em /collection/:id */
  static async updateHeroImage(id, heroImage) {
    try {
      const [result] = await pool.query(
        'UPDATE product_families SET hero_image = ? WHERE id = ?',
        [heroImage, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product family hero image:', error);
      throw error;
    }
  }

  /** Define (ou limpa, com null) a imagem do cartão da página inicial. */
  static async updateCardImage(id, cardImage) {
    try {
      const [result] = await pool.query(
        'UPDATE product_families SET card_image = ? WHERE id = ?',
        [cardImage, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product family card image:', error);
      throw error;
    }
  }

  /**
   * Atualiza os campos de conteúdo editáveis na área Coleções.
   * Deliberadamente não toca em code/parent_id — esses continuam a ser
   * geridos em "Categorias e Cores", onde a hierarquia é visível.
   */
  static async updateContent(id, { name, description, seoTitle, seoDescription }) {
    try {
      const [result] = await pool.query(
        `UPDATE product_families
            SET name = ?, description = ?, seo_title = ?, seo_description = ?
          WHERE id = ?`,
        [name, description || null, seoTitle || null, seoDescription || null, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product family content:', error);
      throw error;
    }
  }

  // Delete a product family (e descendentes em cascata - primeiro os filhos)
  static async delete(id) {
    try {
      const [all] = await pool.query('SELECT id, parent_id FROM product_families');
      const toDelete = this.getDescendantIdsByDepth(all, id);
      for (const did of toDelete) {
        const [products] = await pool.query('SELECT COUNT(*) as count FROM products WHERE family_id = ?', [did]);
        if (products[0].count > 0) {
          throw new Error(`Não é possível eliminar: a categoria ou uma subcategoria tem produto(s) associado(s).`);
        }
      }
      for (const did of toDelete) {
        await pool.query('DELETE FROM product_families WHERE id = ?', [did]);
      }
      return true;
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
        SELECT f.*, COUNT(p.id) as product_count,
               (SELECT pi.image_filename
                  FROM product_images pi
                  JOIN products p2 ON p2.id = pi.product_id
                 WHERE p2.family_id = f.id AND p2.is_active = 1
                 ORDER BY pi.is_primary DESC, p2.featured DESC, pi.id ASC
                 LIMIT 1) AS fallback_image
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

  /**
   * Build hierarchical tree from flat list (suporta subsubcat, subsubsubcat, etc.)
   * @param {Array} flat - Lista plana com parent_id
   * @returns {Array} Árvore [{ ...item, children: [...] }]
   */
  static buildTree(flat) {
    if (!flat || !Array.isArray(flat)) return [];
    const map = {};
    const roots = [];
    flat.forEach(item => {
      const node = { ...item, children: [] };
      map[item.id] = node;
    });
    flat.forEach(item => {
      const node = map[item.id];
      const parentId = item.parent_id;
      if (!parentId || !map[parentId]) {
        roots.push(node);
      } else {
        map[parentId].children.push(node);
      }
    });
    const sortChildren = (nodes) => {
      nodes.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      nodes.forEach(n => { if (n.children?.length) sortChildren(n.children); });
    };
    sortChildren(roots);
    return roots;
  }

  /**
   * Get all families as tree (para listagem em árvore)
   */
  static async getTreeWithProductCount() {
    const flat = await this.getAllWithProductCount();
    return this.buildTree(flat);
  }

  /**
   * Get IDs of node and all descendants (para excluir em selects de parent - evita ciclos)
   */
  static getDescendantIds(flat, id) {
    const ids = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      flat.forEach(f => {
        if (f.parent_id != null && ids.has(f.parent_id) && !ids.has(f.id)) {
          ids.add(f.id);
          changed = true;
        }
      });
    }
    return Array.from(ids);
  }

  /**
   * Dado um conjunto de IDs selecionados, retorna esses IDs + todos os descendentes.
   * Usado no catálogo: ao selecionar "Aneis" (parent), incluir produtos de subcategorias.
   */
  static getFamilyIdsWithDescendants(flat, selectedIds) {
    if (!selectedIds || selectedIds.length === 0) return [];
    const expanded = new Set();
    selectedIds.forEach(id => {
      expanded.add(id);
      const desc = this.getDescendantIds(flat, id);
      desc.forEach(d => expanded.add(d));
    });
    return Array.from(expanded);
  }

  /** Ordenar IDs por profundidade (mais profundos primeiro) para delete em cascata */
  static getDescendantIdsByDepth(flat, id) {
    const ids = this.getDescendantIds(flat, id);
    const depthOf = {};
    ids.forEach(i => { depthOf[i] = 0; });
    let changed = true;
    while (changed) {
      changed = false;
      flat.forEach(f => {
        if (ids.includes(f.id) && f.parent_id != null && ids.includes(f.parent_id)) {
          const d = depthOf[f.parent_id] + 1;
          if (d > depthOf[f.id]) { depthOf[f.id] = d; changed = true; }
        }
      });
    }
    return ids.sort((a, b) => depthOf[b] - depthOf[a]);
  }
}

module.exports = ProductFamily; 