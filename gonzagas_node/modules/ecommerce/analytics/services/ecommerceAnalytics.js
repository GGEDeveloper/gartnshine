const { pool } = require('../../../../config/database');

async function trackCartAdd(productId) {
  try {
    await pool.query(
      `INSERT INTO product_analytics (product_id, cart_adds, updated_at)
       VALUES (?, 1, NOW())
       ON DUPLICATE KEY UPDATE cart_adds = cart_adds + 1, updated_at = NOW()`,
      [productId]
    );
  } catch {
    /* table may not exist */
  }
}

async function trackPurchase(order) {
  if (!order?.items) return;
  for (const item of order.items) {
    try {
      await pool.query(
        `INSERT INTO product_analytics (product_id, purchases, revenue, updated_at)
         VALUES (?, 1, ?, NOW())
         ON DUPLICATE KEY UPDATE purchases = purchases + 1, revenue = revenue + ?, updated_at = NOW()`,
        [item.product_id, item.total_price, item.total_price]
      );
    } catch {
      /* optional */
    }
  }
}

module.exports = { trackCartAdd, trackPurchase };
