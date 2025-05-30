const { pool } = require('../config/database');
const BaseModel = require('./BaseModel');

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
  static async getAll(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, p.sale_price as price, f.name as family_name, (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url 
        FROM products p
        LEFT JOIN product_families f ON p.family_id = f.id
        ORDER BY p.reference
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      console.log('Query executada com sucesso. Produtos encontrados:', rows.length);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
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
   * Get active products visible in the catalog with pagination and image.
   */
  static async getActiveForCatalog(limit = 12, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.reference,

          p.family_id,

          p.is_active,
          p.sale_price as price,
          p.description,
          f.name as family_name,
          (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url
        FROM products p
        LEFT JOIN product_families f ON p.family_id = f.id
        WHERE p.is_active = 1
        ORDER BY p.featured DESC, p.reference ASC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
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
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as total FROM products');
      return rows[0].total;
    } catch (error) {
      console.error('Erro ao contar produtos:', error);
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
  static async getFeatured(limit = 4) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, f.name as family_name, 
               (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as image_url
        FROM products p
        JOIN product_families f ON p.family_id = f.id
        WHERE p.is_active = 1 AND p.featured = 1
        ORDER BY p.reference
        LIMIT ?
      `, [limit]);
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
      product.images = imageRows.map(img => ({...img, url: `/media/${img.image_filename}`}) );
      
      // Se não houver imagem primária, define a primeira imagem como primária (ou a primeira da lista)
      if (product.images.length > 0 && !product.images.some(img => img.is_primary)) {
        // product.images[0].is_primary = 1; // Não modificar o estado aqui, apenas para exibição
      }
      // Define a imagem principal do produto para fácil acesso no template
      const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
      product.image_url = primaryImage ? primaryImage.url : null; // '/media/products/no-image.jpg';

      return product;
    } catch (error) {
      console.error('Error finding product by ID with details:', error);
      throw error;
    }
  }

  // Get recent products
  static async getRecent(limit = 5) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.id, 
          p.name, 
          p.reference, 
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

  // Adicionar um novo produto com imagens
  static async createProductWithImages(productData, imageFiles, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Mapear campos permitidos para inserção
      const productFields = ['name', 'reference', 'description', 'family_id', 'sale_price', 'purchase_price', 'current_stock', 'min_stock', 'tax_rate', 'weight', 'dimensions', 'is_active', 'is_catalog_visible', 'featured', 'notes'];
      const fieldsToInsert = {};

      // Filtrar e converter campos
      productFields.forEach(field => {
        if (productData[field] !== undefined) {
          // Converter strings vazias para NULL para campos numéricos
          if ((field === 'family_id' || field === 'current_stock' || field === 'min_stock') && productData[field] === '') {
            fieldsToInsert[field] = null;
          } 
          // Converter strings vazias para NULL para campos decimais
          else if ((field === 'sale_price' || field === 'purchase_price' || field === 'weight') && productData[field] === '') {
            fieldsToInsert[field] = null;
          }
          // Converter strings booleanas para 0/1
          else if (field === 'is_active' || field === 'is_catalog_visible' || field === 'featured') {
            fieldsToInsert[field] = productData[field] === 'true' || productData[field] === true ? 1 : 0;
          }
          // Manter outros campos como estão
          else {
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
      
      // Registar transação de stock inicial se houver stock
      if (fieldsToInsert.current_stock && parseFloat(fieldsToInsert.current_stock) > 0) {
        await connection.query(
          'INSERT INTO inventory_transactions (product_id, transaction_type, quantity, notes, unit_price) VALUES (?, ?, ?, ?, ?)',
          [productId, 'initial_stock', parseFloat(fieldsToInsert.current_stock), 'Stock inicial do produto', fieldsToInsert.purchase_price || 0]
        );
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
      const productFields = ['name', 'reference', 'description', 'family_id', 'sale_price', 'purchase_price', 'min_stock', 'weight', 'dimensions', 'is_active', 'is_catalog_visible', 'featured', 'notes'];
      const fieldsToUpdate = {};

      // Filtrar e converter campos
      productFields.forEach(field => {
        if (productData[field] !== undefined) {
          // Converter strings vazias para NULL para campos numéricos
          if ((field === 'family_id' || field === 'min_stock') && productData[field] === '') {
            fieldsToUpdate[field] = null;
          } 
          // Converter strings vazias para NULL para campos decimais
          else if ((field === 'sale_price' || field === 'purchase_price' || field === 'weight') && productData[field] === '') {
            fieldsToUpdate[field] = null;
          }
          // Converter strings booleanas para 0/1
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

  // Obter todos os produtos com informações de stock, filtros e paginação
  static async getAllWithStock(options = {}) {
    const {
      limit = 20, // Default limit
      offset = 0,  // Default offset
      family_id,
      search,
      low_stock,
      out_of_stock
    } = options;

    try {
      let whereClauses = ['p.is_active = 1']; // Start with a base condition, e.g., only active products
      const params = [];
      const countParams = [];

      if (family_id) {
        whereClauses.push('p.family_id = ?');
        params.push(family_id);
        countParams.push(family_id);
      }

      if (search) {
        whereClauses.push('(p.name LIKE ? OR p.reference LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
        countParams.push(searchTerm, searchTerm);
      }

      if (low_stock) {
        // Assumes min_stock is a column in products table indicating the threshold
        whereClauses.push('p.current_stock > 0 AND p.current_stock <= p.min_stock');
      }

      if (out_of_stock) {
        whereClauses.push('p.current_stock <= 0');
      }

      const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Query para obter o total de produtos com os filtros aplicados
      const countSql = `
        SELECT COUNT(*) as total
        FROM products p
        ${whereString}
      `;
      const [countResult] = await pool.query(countSql, countParams);
      const totalProducts = countResult[0].total;

      // Query para obter os produtos com os filtros e paginação
      const productsSqlParams = [...params]; // Use a copy for the products query before adding limit/offset
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
      throw error; // Rethrow or handle as appropriate for your application
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