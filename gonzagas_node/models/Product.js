const { pool } = require('../config/database');
const BaseModel = require('./BaseModel');
const path = require('path');
const fs = require('fs').promises;
const { deleteProductImageVariants } = require('../utils/productImageProcessor');

class Product extends BaseModel {
  static tableName = 'products';
  static primaryKey = 'id';
  constructor() {
    super();
    // tableName and primaryKey are now static properties
  }
  
  // Adicionando o pool como propriedade estática da classe
  static get pool() {
    return pool;
  }
  // Get all products with family information and pagination support
  static async getAll(limit = 10, offset = 0, filterOptions = {}, sortOptions = {}) {
    try {
      const whereClauses = [];
      const params = [];

      if (filterOptions.reference) {
        whereClauses.push('p.reference LIKE ?');
        params.push(`%${filterOptions.reference}%`);
      }

      if (filterOptions.categoryName && filterOptions.categoryName !== '') {
        const [families] = await pool.query('SELECT id FROM product_families WHERE name = ?', [filterOptions.categoryName]);
        if (families.length > 0) {
          whereClauses.push('p.family_id = ?');
          params.push(families[0].id);
        } else {
          // Category name provided but not found, so no results should match this specific filter
          whereClauses.push('1 = 0'); // Effectively makes the query return no rows for this condition
        }
      }

      if (filterOptions.status) {
        whereClauses.push('p.is_active = ?');
        params.push(filterOptions.status === 'Ativo' ? 1 : 0);
      }

      if (filterOptions.stock_status) {
        if (filterOptions.stock_status === 'in_stock') {
          whereClauses.push('p.current_stock > 0');
        } else if (filterOptions.stock_status === 'low_stock') {
          whereClauses.push('(p.current_stock > 0 AND p.current_stock <= 10)'); // Low stock threshold is 10
        } else if (filterOptions.stock_status === 'out_of_stock') {
          whereClauses.push('(p.current_stock IS NULL OR p.current_stock <= 0)');
        }
      }

      let whereString = '';
      if (whereClauses.length > 0) {
        whereString = `WHERE ${whereClauses.join(' AND ')}`;
      }

      const allowedSort = ['id', 'reference', 'name', 'sale_price', 'current_stock', 'is_active', 'created_at', 'family_name'];
      const sortBy = allowedSort.includes(sortOptions.sortBy) ? sortOptions.sortBy : 'reference';
      const sortOrder = (sortOptions.sortOrder || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      const orderColumn = sortBy === 'family_name' ? 'f.name' : `p.${sortBy}`;

      const sql = `
        SELECT p.*, p.sale_price as price, f.name as family_name, 
               (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url 
        FROM products p
        LEFT JOIN product_families f ON p.family_id = f.id
        ${whereString}
        ORDER BY ${orderColumn} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const queryParams = [...params, limit, offset];
      // console.log('Executing SQL for getAll:', sql, 'with params:', queryParams);
      const [rows] = await pool.query(sql, queryParams);
      console.log('Product.getAll filtered query executed. Products found:', rows.length);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar produtos com filtros:', error);
      throw error;
    }  
  }

  // Count products out of stock
  static async countOutOfStock() {
    try {
      const [rows] = await this.pool.query(
        `SELECT COUNT(*) as count FROM ${this.tableName} WHERE current_stock <= 0 OR current_stock IS NULL`
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error counting out of stock products:', error);
      throw error;
    }
  }

  // Count products with low stock
  static async countLowStock(threshold = 10) {
    try {
      const [rows] = await this.pool.query(
        `SELECT COUNT(*) as count FROM ${this.tableName} WHERE current_stock > 0 AND current_stock <= ?`,
        [threshold]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error counting low stock products:', error);
      throw error;
    }
  }

  /**
   * Valor potencial se todo o stock atual for vendido ao preço de venda (Σ preço × stock).
   */
  static async getInventoryPotentialSummary() {
    try {
      const [rows] = await this.pool.query(`
        SELECT
          COALESCE(SUM(COALESCE(sale_price, 0) * COALESCE(current_stock, 0)), 0) AS potential_revenue,
          COALESCE(SUM(COALESCE(current_stock, 0)), 0) AS total_units
        FROM ${this.tableName}
      `);
      const r = rows[0];
      return {
        potentialRevenue: parseFloat(r.potential_revenue) || 0,
        totalUnits: parseInt(r.total_units, 10) || 0
      };
    } catch (error) {
      console.error('Error getting inventory potential summary:', error);
      throw error;
    }
  }

  /**
   * Linhas para export (referência, nome, preço, stock, subtotal).
   */
  static async getInventoryExportRows() {
    try {
      const [rows] = await this.pool.query(`
        SELECT
          reference,
          name,
          COALESCE(sale_price, 0) AS sale_price,
          COALESCE(current_stock, 0) AS stock,
          COALESCE(sale_price, 0) * COALESCE(current_stock, 0) AS line_total
        FROM ${this.tableName}
        ORDER BY reference ASC
      `);
      return rows.map((row) => ({
        reference: row.reference,
        name: row.name,
        sale_price: parseFloat(row.sale_price) || 0,
        stock: parseInt(row.stock, 10) || 0,
        line_total: parseFloat(row.line_total) || 0
      }));
    } catch (error) {
      console.error('Error getting inventory export rows:', error);
      throw error;
    }
  }

  /**
   * Get active products visible in the catalog with pagination and image.
   */
  static async getActiveForCatalog(limit = 12, offset = 0, options = {}) {
    try {
      const { hideOutOfStock = false } = options;
      let whereClause = 'p.is_active = 1 AND p.is_catalog_visible = 1';
      const params = [];
      if (hideOutOfStock) {
        whereClause += ' AND (p.current_stock IS NOT NULL AND p.current_stock > 0)';
      }
      params.push(limit, offset);
      const [rows] = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.reference,
          p.family_id,
          p.is_active,
          p.sale_price,
          p.purchase_price,
          p.current_stock,
          p.description,
          f.name as family_name,
          (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url
        FROM products p
        LEFT JOIN product_families f ON p.family_id = f.id
        WHERE ${whereClause}
        ORDER BY p.featured DESC, p.reference ASC
        LIMIT ? OFFSET ?
      `, params);
      return rows;
    } catch (error) {
      console.error('Error getting active products for catalog:', error);
      throw error;
    }
  }

  /**
   * Count active products visible in the catalog.
   */
  static async countActiveForCatalog() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
      return rows[0].count;
    } catch (error) {
      console.error('Error counting active products for catalog:', error);
      throw error;
    }
  }
  
  // Count total number of products
  static async count(filterOptions = {}) {
    try {
      const whereClauses = [];
      const params = [];

      if (filterOptions.reference) {
        whereClauses.push('p.reference LIKE ?');
        params.push(`%${filterOptions.reference}%`);
      }

      if (filterOptions.categoryName && filterOptions.categoryName !== '') {
        const [families] = await pool.query('SELECT id FROM product_families WHERE name = ?', [filterOptions.categoryName]);
        if (families.length > 0) {
          whereClauses.push('p.family_id = ?');
          params.push(families[0].id);
        } else {
          whereClauses.push('1 = 0'); 
        }
      }

      if (filterOptions.status) {
        whereClauses.push('p.is_active = ?');
        params.push(filterOptions.status === 'Ativo' ? 1 : 0);
      }

      if (filterOptions.stock_status) {
        if (filterOptions.stock_status === 'in_stock') {
          whereClauses.push('p.current_stock > 0');
        } else if (filterOptions.stock_status === 'low_stock') {
          whereClauses.push('(p.current_stock > 0 AND p.current_stock <= 10)');
        } else if (filterOptions.stock_status === 'out_of_stock') {
          whereClauses.push('(p.current_stock IS NULL OR p.current_stock <= 0)');
        }
      }

      let whereString = '';
      if (whereClauses.length > 0) {
        // Note: we use 'products p' in the FROM clause for consistency with getAll, though 'p.' isn't strictly needed for COUNT if not joining
        whereString = `WHERE ${whereClauses.join(' AND ')}`;
      }

      const sql = `SELECT COUNT(*) as total FROM products p ${whereString}`;
      // console.log('Executing SQL for count:', sql, 'with params:', params);
      const [rows] = await pool.query(sql, params);
      return rows[0].total;
    } catch (error) {
      console.error('Erro ao contar produtos com filtros:', error);
      throw error;
    }
  }

  // Get active products for the catalog with pagination
  static async getActive(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name 
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.is_active = 1
        ORDER BY p.featured DESC, p.reference
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      return rows;
    } catch (error) {
      console.error('Error getting active products:', error);
      throw error;
    }
  }
  
  // Count active products
  static async countActive() {

    try {
      const [rows] = await pool.query('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
      return rows[0].total;
    } catch (error) {
      console.error('Error counting active products:', error);
      throw error;
    }
  }

  // Get featured products
  static async getFeatured(limit = null, hideOutOfStock = false) {
    try {
      const stockFilter = hideOutOfStock ? 'AND p.current_stock > 0' : '';
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name,
               (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.is_active = 1 AND p.featured = 1 ${stockFilter}
        ORDER BY p.reference
    `);
      return rows;
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  }

  // Get products by family with pagination
  static async getByFamily(familyId, limit = 10, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name, 
               (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.is_active = 1 AND p.family_id = ?
        ORDER BY p.reference
        LIMIT ? OFFSET ?
      `, [familyId, limit, offset]);
      return rows;
    } catch (error) {
      console.error('Error getting products by family:', error);
      throw error;
    }
  }

  // Count products by family
  static async countByFamily(familyId) {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as total FROM products WHERE is_active = 1 AND family_id = ?', [familyId]);
      return rows[0].total;
    } catch (error) {
      console.error('Error counting products by family:', error);
      throw error;
    }
  }

  // Search products with pagination
  static async search(query, limit = 10, offset = 0) {
    try {
      const searchQuery = '%' + query + '%';
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name, 
               (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.is_active = 1 AND (p.name LIKE ? OR p.description LIKE ? OR p.reference LIKE ? OR f.name LIKE ?)
        ORDER BY p.reference
        LIMIT ? OFFSET ?
      `, [searchQuery, searchQuery, searchQuery, searchQuery, limit, offset]);
      return rows;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Count search results
  static async countSearch(query) {
    try {
      const searchQuery = '%' + query + '%';
      const [rows] = await pool.query(`
        SELECT COUNT(*) as total 
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.is_active = 1 AND (p.name LIKE ? OR p.description LIKE ? OR p.reference LIKE ? OR f.name LIKE ?)
      `, [searchQuery, searchQuery, searchQuery, searchQuery]);
      return rows[0].total;
    } catch (error) {
      console.error('Error counting search results:', error);
      throw error;
    }
  }

  // Get a single product by its ID, including family name and images
  static async findByIdWithDetails(id) {
    try {
      const [productRows] = await pool.query(`
        SELECT p.*, f.name as family_name
        FROM products p
        LEFT JOIN product_families f ON p.family_id = f.id
        WHERE p.id = ?
      `, [id]);

      if (productRows.length === 0) {
        return null;
      }
      const product = productRows[0];

      const [imageRows] = await pool.query(
        'SELECT id, image_filename, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC, id ASC',
        [id]
      );
      product.images = imageRows.map(img => ({...img, url: `/media/products/${img.image_filename}`}) );
      
      // Se não houver imagem primária, define a primeira imagem como primária (ou a primeira da lista)
      if (product.images.length > 0 && !product.images.some(img => img.is_primary)) {
        // product.images[0].is_primary = 1; // Não modificar o estado aqui, apenas para exibição
      }
      // Define a imagem principal do produto para fácil acesso no template
      // image_url deve conter apenas o nome do arquivo (como está no banco), não o caminho completo
      const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
      product.image_url = primaryImage ? primaryImage.image_filename : null;

      return product;
    } catch (error) {
      console.error('Error finding product by ID with details:', error);
      throw error;
    }
  }

  /** Devolve o id do produto anterior e seguinte (por ordem de id), ignorando buracos deixados por remoções. */
  static async getAdjacentIds(id) {
    const [prevRows] = await pool.query('SELECT id FROM products WHERE id < ? ORDER BY id DESC LIMIT 1', [id]);
    const [nextRows] = await pool.query('SELECT id FROM products WHERE id > ? ORDER BY id ASC LIMIT 1', [id]);
    return {
      prevId: prevRows[0] ? prevRows[0].id : null,
      nextId: nextRows[0] ? nextRows[0].id : null,
    };
  }

  // Get recent products
  static async getRecent(limit = 5) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.id, 
          p.name, 
          p.reference, 
          p.current_stock,
          (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url, 
          p.created_at 
        FROM products p
        ORDER BY p.created_at DESC 
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      console.error('Error getting recent products:', error);
      throw error;
    }
  }

  // Count all products (admin)
  static async countAll() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as total FROM products');
      return rows[0].total;
    } catch (error) {
      console.error('Error counting all products:', error);
      throw error;
    }
  }

  // Get products with low stock
  static async getLowStock(limit = 10, offset = 0, threshold = null) {
    try {
      const [rows] = await pool.query(`
        SELECT p.id, p.name, p.reference, p.current_stock, p.min_stock, 
               (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url
        FROM products p
        WHERE p.current_stock > 0 AND p.current_stock <= p.min_stock
        ORDER BY p.current_stock ASC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      return rows;
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw error;
    }
  }
  
  static async countLowStock() {
    try {
      const [rows] = await pool.query(`
        SELECT COUNT(*) as total
        FROM products
        WHERE current_stock > 0 AND current_stock <= min_stock
      `);
      return rows[0].total;
    } catch (error) {
      console.error('Error counting low stock products:', error);
      throw error;
    }
  }

  // Get next reference for a given prefix (e.g. PAN -> PAN0001)
  static async getNextReference(prefix) {
    try {
      const safePrefix = (prefix || 'GEN').substring(0, 10).toUpperCase();
      const pattern = `%${safePrefix}%`;
      const [rows] = await pool.query(
        `SELECT reference FROM products WHERE reference LIKE ? ORDER BY reference DESC LIMIT 1`,
        [pattern]
      );
      if (rows.length === 0) {
        return `${safePrefix}0001`;
      }
      const lastRef = rows[0].reference;
      const match = lastRef.match(new RegExp(`^${safePrefix}(\\d+)$`, 'i'));
      const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
      return `${safePrefix}${String(nextNum).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error getting next reference:', error);
      throw error;
    }
  }

  // Adicionar um novo produto com imagens
  static async createProductWithImages(productData, imageFiles, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Mapear campos permitidos para inserção
      const productFields = ['name', 'reference', 'description', 'family_id', 'sale_price', 'purchase_price', 'current_stock', 'min_stock', 'tax_rate', 'weight', 'dimensions', 'location', 'style', 'material', 'color', 'notes', 'attributes', 'is_active', 'is_catalog_visible', 'featured', 'barcode'];
      const fieldsToInsert = {};

      // Filtrar e converter campos
      productFields.forEach(field => {
        if (productData[field] !== undefined) {
          if ((field === 'family_id' || field === 'current_stock' || field === 'min_stock') && productData[field] === '') {
            fieldsToInsert[field] = null;
          } else if ((field === 'sale_price' || field === 'purchase_price' || field === 'weight' || field === 'tax_rate') && productData[field] === '') {
            fieldsToInsert[field] = null;
          } else if (field === 'is_active' || field === 'is_catalog_visible' || field === 'featured') {
            fieldsToInsert[field] = productData[field] === 'true' || productData[field] === true ? 1 : 0;
          } else if (field === 'attributes') {
            if (typeof productData[field] === 'object') fieldsToInsert[field] = JSON.stringify(productData[field]);
            else if (productData[field]) fieldsToInsert[field] = productData[field];
          } else {
            fieldsToInsert[field] = productData[field];
          }
        }
      });

      // Adicionar dados de criação
      fieldsToInsert.created_by = userId;
      fieldsToInsert.updated_by = userId;

      // Se current_stock for maior que 0, atualizar last_stock_update
      if (fieldsToInsert.current_stock && parseFloat(fieldsToInsert.current_stock) > 0) {
        fieldsToInsert.last_stock_update = new Date();
      }

      // Inserir o produto
      const [result] = await connection.query('INSERT INTO products SET ?', [fieldsToInsert]);
      const productId = result.insertId;

      // Inserir imagens
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const image = imageFiles[i];
          await connection.query('INSERT INTO product_images (product_id, image_filename, is_primary, sort_order) VALUES (?, ?, ?, ?)', 
            [productId, image.filename, image.is_primary || (i === 0), i + 1]
          );
        }
      }
      
      // Registar transação de stock inicial se houver stock (resiliente: tabela pode não existir em algumas DBs)
      if (fieldsToInsert.current_stock && parseFloat(fieldsToInsert.current_stock) > 0) {
        try {
          const qty = parseFloat(fieldsToInsert.current_stock);
          const unitPrice = fieldsToInsert.purchase_price || 0;
          const totalAmount = unitPrice * qty;
          await connection.query(
            'INSERT INTO inventory_transactions (product_id, transaction_type, quantity, unit_price, total_amount, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [productId, 'in', qty, unitPrice, totalAmount, 'Stock inicial do produto', userId]
          );
        } catch (invErr) {
          console.warn(' inventory_transactions insert skipped (table may not exist):', invErr.message);
          // Produto criado com sucesso; stock fica apenas em products.current_stock
        }
      }

      await connection.commit();
      return productId;
    } catch (error) {
      await connection.rollback();
      console.error('Error creating product with images:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Atualizar um produto com imagens
  static async updateProductWithImages(productId, productData, imageFiles, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Mapear campos permitidos para atualização
      const productFields = ['name', 'reference', 'description', 'family_id', 'sale_price', 'purchase_price', 'current_stock', 'min_stock', 'tax_rate', 'weight', 'dimensions', 'location', 'style', 'material', 'color', 'notes', 'attributes', 'is_active', 'is_catalog_visible', 'featured', 'barcode'];
      const fieldsToUpdate = {};

      // Filtrar e converter campos
      productFields.forEach(field => {
        if (productData[field] !== undefined) {
          // Converter strings vazias para NULL para campos numéricos
          if ((field === 'family_id' || field === 'min_stock') && productData[field] === '') {
            fieldsToUpdate[field] = null;
          }
          // Converter current_stock para inteiro
          else if (field === 'current_stock') {
            fieldsToUpdate[field] = productData[field] !== undefined && productData[field] !== '' ? parseInt(productData[field], 10) : 0;
          } 
          else if ((field === 'sale_price' || field === 'purchase_price' || field === 'weight' || field === 'tax_rate') && productData[field] === '') {
            fieldsToUpdate[field] = null;
          }
          else if (field === 'attributes') {
            if (typeof productData[field] === 'object') fieldsToUpdate[field] = JSON.stringify(productData[field]);
            else if (productData[field]) fieldsToUpdate[field] = productData[field];
          }
          else if (field === 'is_active' || field === 'is_catalog_visible' || field === 'featured') {
            fieldsToUpdate[field] = productData[field] === 'true' || productData[field] === true ? 1 : 0;
          }
          // Manter outros campos como estão
          else {
            fieldsToUpdate[field] = productData[field];
          }
        }
      });

      // Adicionar dados de atualização
      fieldsToUpdate.updated_by = userId;
      fieldsToUpdate.updated_at = new Date();

      // Atualizar o produto
      await connection.query('UPDATE products SET ? WHERE id = ?', [fieldsToUpdate, productId]);

      // Gerir imagens a apagar
      const imagesToDelete = productData.imagesToDelete || [];
      if (imagesToDelete && imagesToDelete.length > 0) {
        // TODO: Apagar ficheiros do sistema de ficheiros antes de apagar do DB
        // Por agora, apenas remove do DB
        const placeholders = imagesToDelete.map(() => '?').join(',');
        await connection.query(`DELETE FROM product_images WHERE product_id = ? AND id IN (${placeholders})`, [productId, ...imagesToDelete]);
      }

      // Gerir novas imagens
      if (imageFiles && imageFiles.length > 0) {
        let primaryImageExistsOrSet = productData.primary_image_id || false;
        if (!primaryImageExistsOrSet) {
          const [existingPrimary] = await connection.query('SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1', [productId]);
          if (existingPrimary.length > 0) primaryImageExistsOrSet = true;
        }

        for (let i = 0; i < imageFiles.length; i++) {
          const image = imageFiles[i];
          let isPrimary = image.is_primary || false;

          if (!primaryImageExistsOrSet && i === 0 && !productData.primary_image_id) {
            isPrimary = true;
            primaryImageExistsOrSet = true;
          }

          const [maxSortOrderRows] = await connection.query('SELECT MAX(sort_order) as max_so FROM product_images WHERE product_id = ?', [productId]);
          const nextSortOrder = (maxSortOrderRows[0].max_so || 0) + 1 + i;

          await connection.query('INSERT INTO product_images (product_id, image_filename, is_primary, sort_order) VALUES (?, ?, ?, ?)', 
            [productId, image.filename, isPrimary, nextSortOrder]
          );
        }
      }

      // Atualizar imagem primária se especificado (e.g., a partir de productData.primary_image_id)
      if (productData.primary_image_id) {
        await connection.query('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [productId]);
        await connection.query('UPDATE product_images SET is_primary = 1 WHERE product_id = ? AND id = ?', [productId, productData.primary_image_id]);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error updating product with images:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAllWithStock(options = {}) {
  console.log('--- Product.getAllWithStock ---');
  console.log('Received options:', JSON.stringify(options, null, 2));

  const {
    limit = 20, // Default limit
    offset = 0,  // Default offset
    reference,
    categoryName,
    status,
    stock_status
  } = options;

  try {
    let whereClauses = [];
    const params = [];
    const countParams = [];

    // Handle product status (active/inactive)
    if (status) {
      whereClauses.push('p.is_active = ?');
      const statusVal = status === 'active' ? 1 : 0;
      params.push(statusVal);
      countParams.push(statusVal);
    } else {
      // Default to active products if no status filter is specified
      whereClauses.push('p.is_active = 1');
      // No param needed for default active status unless we explicitly add 1 to params
    }

    if (reference) {
      whereClauses.push('p.reference LIKE ?');
      const refTerm = `%${reference}%`;
      params.push(refTerm);
      countParams.push(refTerm);
    }

    if (categoryName) {
      whereClauses.push('f.name LIKE ?'); // Join with product_families as f is in the main query
      const catTerm = `%${categoryName}%`;
      params.push(catTerm);
      countParams.push(catTerm);
    }

    if (stock_status) {
      if (stock_status === 'in_stock') {
        whereClauses.push('p.current_stock > 10');
      } else if (stock_status === 'low_stock') {
        whereClauses.push('p.current_stock > 0 AND p.current_stock <= 10');
      } else if (stock_status === 'out_of_stock') {
        whereClauses.push('p.current_stock <= 0');
      }
    }

    console.log('Constructed whereClauses:', JSON.stringify(whereClauses));
    console.log('Constructed params (for main query, before limit/offset):', JSON.stringify(params));
    console.log('Constructed countParams:', JSON.stringify(countParams));

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    console.log('Generated whereString:', whereString);

    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN product_families f ON p.family_id = f.id
      ${whereString}
    `;
    console.log('Generated countSql:', countSql);
    console.log('Parameters for countSql:', JSON.stringify(countParams));
    const [countResult] = await pool.query(countSql, countParams);
    const totalProducts = countResult[0].total;

    const productsSqlParams = [...params];
    productsSqlParams.push(limit, offset);

    const productsSql = `
      SELECT 
        p.*, 
        f.name as family_name,
        (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url,
        (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count,
        p.current_stock as current_stock_value 
      FROM products p
      LEFT JOIN product_families f ON p.family_id = f.id
      ${whereString}
      ORDER BY p.reference ASC
      LIMIT ? OFFSET ?
    `;
    
    console.log('Generated productsSql:', productsSql);
    console.log('Parameters for productsSql:', JSON.stringify(productsSqlParams));
    const [rows] = await pool.query(productsSql, productsSqlParams);

    const products = rows.map(row => ({
      ...row,
      current_stock: parseFloat(row.current_stock_value) || 0,
      sale_price: parseFloat(row.sale_price) || 0,
      purchase_price: parseFloat(row.purchase_price) || 0,
      weight: parseFloat(row.weight) || 0
    }));

    return { products, totalProducts };

  } catch (error) {
    console.error('Error getting products with stock:', error);
    throw error;
  }
}
  // Registrar histórico de preço
  static async recordPriceHistory(connection, productId, price) {
    try {
      // Verificar se já existe um registro de preço recente (últimos 7 dias)
      const [existing] = await connection.query(
        'SELECT id, price as existing_price FROM product_price_history WHERE product_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY created_at DESC LIMIT 1',
        [productId]
      );
      
      // Se não houver registro recente ou o preço for diferente, registrar
      if (existing.length === 0 || 
          (existing[0].existing_price !== price && existing[0].existing_price !== parseFloat(price))) {
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
  
  // Delete product and associated image files from disk
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      const [images] = await connection.query(
        'SELECT image_filename FROM product_images WHERE product_id = ?',
        [id]
      );
      const mediaDir = path.join(__dirname, '../public/media/products');
      for (const row of images) {
        const filename = row.image_filename;
        if (filename) {
          const filePath = path.join(mediaDir, filename);
          try {
            await fs.unlink(filePath);
          } catch (e) {
            if (e.code !== 'ENOENT') console.warn('Could not delete product image:', filePath, e.message);
          }
          await deleteProductImageVariants(filename);
        }
      }
      const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
      const [result] = await connection.query(sql, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
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