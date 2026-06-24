const { pool } = require('../../../config/database');

async function recordSale(productId, quantity, unitPrice, orderNumber, connection) {
  const conn = connection || pool;
  const totalAmount = unitPrice * quantity;

  await conn.query(
    'UPDATE products SET current_stock = GREATEST(0, current_stock - ?) WHERE id = ?',
    [quantity, productId]
  );

  try {
    await conn.query(
      `INSERT INTO inventory_transactions
       (product_id, transaction_type, quantity, unit_price, total_amount, notes, created_by)
       VALUES (?, 'sale', ?, ?, ?, ?, NULL)`,
      [productId, -Math.abs(quantity), unitPrice, totalAmount, `Online order ${orderNumber}`]
    );
  } catch (err) {
    if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }
}

async function restoreStock(productId, quantity, orderNumber, connection) {
  const conn = connection || pool;
  await conn.query(
    'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
    [quantity, productId]
  );

  try {
    await conn.query(
      `INSERT INTO inventory_transactions
       (product_id, transaction_type, quantity, unit_price, total_amount, notes, created_by)
       VALUES (?, 'adjustment', ?, 0, 0, ?, NULL)`,
      [productId, Math.abs(quantity), `Stock restored — order ${orderNumber} cancelled/refunded`]
    );
  } catch (err) {
    if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }
}

module.exports = { recordSale, restoreStock };
