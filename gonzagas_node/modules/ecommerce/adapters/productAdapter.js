const Product = require('../../../models/Product');
const { pool } = require('../../../config/database');

async function findById(id) {
  const product = await Product.findById(id);
  if (!product) return null;
  return normalizeProduct(product);
}

async function findByIdForCart(id) {
  const [rows] = await pool.query(
    `SELECT p.id, p.reference, p.name, p.sale_price, p.base_price, p.tax_rate, p.current_stock, p.is_active,
            (SELECT pi.image_filename FROM product_images pi
             WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image_filename
     FROM products p WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) return null;
  return normalizeProduct(rows[0]);
}

function normalizeProduct(row) {
  return {
    id: row.id,
    reference: row.reference,
    name: row.name,
    salePrice: parseFloat(row.sale_price ?? row.price ?? 0),
    basePrice: parseFloat(row.base_price ?? 0),
    taxRate: parseFloat(row.tax_rate ?? 23),
    currentStock: parseInt(row.current_stock ?? 0, 10) || 0,
    isActive: !!row.is_active,
    imageFilename: row.image_filename || row.image_url || null,
  };
}

module.exports = { findById, findByIdForCart, normalizeProduct };
