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
      // Só famílias com produtos activos — próprios ou das subcategorias.
      // Sem isto entravam no sitemap páginas de listagem vazias (conteúdo
      // fino, que o Google penaliza).
      const [rows] = await pool.execute(`
        SELECT f.id, f.name, f.slug, f.updated_at
        FROM product_families f
        WHERE EXISTS (
          SELECT 1 FROM products p
          JOIN product_families c ON c.id = p.family_id
          WHERE p.is_active = 1 AND (c.id = f.id OR c.parent_id = f.id)
        )
        ORDER BY f.updated_at DESC
      `);
      return rows;
    } catch (error) {
      if (error.message && error.message.includes("Unknown column 'slug'")) {
        const [rows] = await pool.execute(`
          SELECT f.id, f.name, f.updated_at
          FROM product_families f
          WHERE EXISTS (
            SELECT 1 FROM products p
            JOIN product_families c ON c.id = p.family_id
            WHERE p.is_active = 1 AND (c.id = f.id OR c.parent_id = f.id)
          )
          ORDER BY f.updated_at DESC
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
        // A imagem de recurso tem de procurar na ÁRVORE, não só na própria
        // família: as categorias de topo (Prata, Latão…) não têm produtos
        // directos — estão todos nas subcategorias. Sem isto, as páginas de
        // material ficavam sem fotografia no cabeçalho.
        `SELECT f.*,
                (SELECT pi.image_filename
                   FROM product_images pi
                   JOIN products p2 ON p2.id = pi.product_id AND p2.is_active = 1
                   JOIN product_families c2 ON c2.id = p2.family_id
                  WHERE c2.id = f.id OR c2.parent_id = f.id
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

  /**
   * Slug único a partir do nome, para o URL /categoria/:slug.
   *
   * A coluna `slug` existia desde a migração dos slugs mas nunca era escrita:
   * `create` e `update` ignoravam-na, por isso as 25 categorias ficaram todas
   * a NULL e o site servia URLs numéricos (`/collection/16`). Agora é gerado
   * aqui e garantidamente único, porque a coluna tem índice UNIQUE.
   */
  static async buildSlug(name, ignoreId = null) {
    const base = String(name || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // tira acentos (combining marks)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 170) || 'categoria';

    let slug = base;
    let n = 2;
    /* eslint-disable no-await-in-loop */
    while (true) {
      const [rows] = await pool.query(
        `SELECT id FROM product_families WHERE slug = ?${ignoreId ? ' AND id <> ?' : ''} LIMIT 1`,
        ignoreId ? [slug, ignoreId] : [slug]
      );
      if (rows.length === 0) return slug;
      slug = `${base}-${n}`;
      n += 1;
    }
    /* eslint-enable no-await-in-loop */
  }

  // Create a new product family
  static async create(family) {
    try {
      const slug = await this.buildSlug(family.name);
      const [result] = await pool.query(`
        INSERT INTO product_families
        (code, name, slug, description, parent_id)
        VALUES (?, ?, ?, ?, ?)
      `, [
        family.code,
        family.name,
        slug,
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
      // O slug só é regenerado se ainda não existir. Mudar o slug de uma
      // categoria já indexada partiria os links do Google sem redirect.
      const [[atual]] = await pool.query(
        'SELECT slug FROM product_families WHERE id = ?', [id]
      );
      const slug = (atual && atual.slug)
        ? atual.slug
        : await this.buildSlug(family.name, id);

      const [result] = await pool.query(`
        UPDATE product_families SET
        code = ?,
        name = ?,
        slug = ?,
        description = ?,
        parent_id = ?
        WHERE id = ?
      `, [
        family.code,
        family.name,
        slug,
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

  /**
   * Materiais para a secção "Explorar por Material" da página inicial.
   *
   * São as famílias de topo (Prata, Latão, Pedras Naturais, Macramé) — que é o
   * que "material" significa nesta taxonomia. As filhas são tipo+material
   * (Aneis - Prata, Brincos - Latão), por isso mostrá-las ali era mostrar tipos
   * de peça, não materiais.
   *
   * Como as famílias de topo não têm produtos directos, a contagem e a imagem
   * vêm das subcategorias.
   */
  /**
   * Materiais (categorias de topo) com contagem de peças.
   *
   * `hideOutOfStock` tem de acompanhar a definição do site: sem isso a
   * contagem aqui (409) contradizia o total do catálogo (220), e via-se
   * "Ver todos: 220 peças" ao lado de "Prata: 258 peças" na mesma linha.
   */
  static async getMaterialsForHome({ hideOutOfStock = false } = {}) {
    const filtroStock = hideOutOfStock ? 'AND p.current_stock > 0' : '';
    const filtroStock2 = hideOutOfStock ? 'AND p2.current_stock > 0' : '';
    try {
      const [rows] = await pool.query(
        `SELECT m.id, m.name, m.slug, m.hero_image, m.card_image,
                (SELECT COUNT(*)
                   FROM products p
                   JOIN product_families c ON c.id = p.family_id
                  WHERE p.is_active = 1 ${filtroStock}
                    AND (c.id = m.id OR c.parent_id = m.id)
                ) AS product_count,
                (SELECT pi.image_filename
                   FROM product_images pi
                   JOIN products p2 ON p2.id = pi.product_id AND p2.is_active = 1 ${filtroStock2}
                   JOIN product_families c2 ON c2.id = p2.family_id
                  WHERE c2.id = m.id OR c2.parent_id = m.id
                  ORDER BY pi.is_primary DESC, p2.featured DESC, pi.id ASC
                  LIMIT 1) AS fallback_image
           FROM product_families m
          WHERE m.parent_id IS NULL
         HAVING product_count > 0
          ORDER BY product_count DESC, m.name ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error getting materials for home:', error);
      return [];
    }
  }

  /**
   * Subcategorias de um material, para a tira que abre na loja por baixo do
   * cartão escolhido.
   *
   * Difere de `getNavigation` em duas coisas que aqui importam: respeita o
   * `hide_out_of_stock` do site (senão a contagem da subcategoria contradiz a
   * do cartão que está mesmo por cima) e traz imagem, para as subcategorias
   * poderem ser cartões e não apenas texto.
   */
  static async getSubcategoriasParaLoja(parentId, { hideOutOfStock = false } = {}) {
    if (!parentId) return [];
    const filtroStock = hideOutOfStock ? 'AND p.current_stock > 0' : '';
    const filtroStock2 = hideOutOfStock ? 'AND p2.current_stock > 0' : '';
    try {
      const [rows] = await pool.query(
        `SELECT f.id, f.name, f.slug, f.card_image, f.hero_image,
                (SELECT COUNT(*)
                   FROM products p
                  WHERE p.family_id = f.id AND p.is_active = 1 ${filtroStock}
                ) AS product_count,
                (SELECT pi.image_filename
                   FROM product_images pi
                   JOIN products p2 ON p2.id = pi.product_id
                    AND p2.is_active = 1 ${filtroStock2}
                  WHERE p2.family_id = f.id
                  ORDER BY pi.is_primary DESC, p2.featured DESC, pi.id ASC
                  LIMIT 1) AS fallback_image
           FROM product_families f
          WHERE f.parent_id = ?
         HAVING product_count > 0
          ORDER BY product_count DESC, f.name ASC`,
        [parentId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting subcategories for shop:', error);
      return [];
    }
  }

  /**
   * Navegação hierárquica de uma página de categoria.
   *
   * Substitui o antigo "Outras Coleções", que despejava as 25 famílias numa
   * lista plana — misturando materiais (Latão) com tipos (Aneis - Prata),
   * chamando-lhes "coleções" e incluindo categorias sem produtos.
   *
   * Devolve `{ parent, siblings, children }`, todos já sem categorias vazias:
   *   - numa categoria de topo (material): `children` são as subcategorias;
   *   - numa subcategoria: `parent` é o material e `siblings` as irmãs.
   */
  static async getNavigation(family) {
    const comProdutos = `
      (SELECT COUNT(*)
         FROM products p
         JOIN product_families c ON c.id = p.family_id
        WHERE p.is_active = 1 AND (c.id = f.id OR c.parent_id = f.id)
      ) AS product_count`;

    try {
      if (!family.parent_id) {
        const [children] = await pool.query(
          `SELECT f.id, f.name, f.slug, ${comProdutos}
             FROM product_families f
            WHERE f.parent_id = ?
           HAVING product_count > 0
            ORDER BY product_count DESC, f.name ASC`,
          [family.id]
        );
        return { parent: null, siblings: [], children };
      }

      const [[parent]] = await pool.query(
        'SELECT id, name, slug FROM product_families WHERE id = ?',
        [family.parent_id]
      );
      const [siblings] = await pool.query(
        `SELECT f.id, f.name, f.slug, ${comProdutos}
           FROM product_families f
          WHERE f.parent_id = ? AND f.id <> ?
         HAVING product_count > 0
          ORDER BY f.name ASC`,
        [family.parent_id, family.id]
      );
      return { parent: parent || null, siblings, children: [] };
    } catch (error) {
      console.error('Error getting family navigation:', error);
      return { parent: null, siblings: [], children: [] };
    }
  }

  /** Define (ou limpa, com null) a imagem de destaque usada em /categoria/:slug */
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