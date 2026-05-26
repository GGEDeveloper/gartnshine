const { pool } = require('../../../../config/database');
const Order = require('../../orders/models/Order');
const inventoryAdapter = require('../../adapters/inventoryAdapter');
const cartService = require('../../cart/services/cartService');
const events = require('../../events');

async function fulfillPaidOrder(orderId, paymentReference, connection) {
  const conn = connection || pool;
  const [orders] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
  const order = orders[0];
  if (!order) throw new Error('Order not found');
  if (order.payment_status === 'paid') {
    return order;
  }

  const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

  for (const item of items) {
    await inventoryAdapter.recordSale(
      item.product_id,
      item.quantity,
      parseFloat(item.unit_price),
      order.order_number,
      conn
    );
  }

  await conn.query(
    `UPDATE orders SET payment_status = 'paid', payment_reference = COALESCE(?, payment_reference),
     status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [paymentReference || null, orderId]
  );

  await Order.addStatusHistory(orderId, order.status, 'confirmed', 'Payment confirmed', 'webhook', conn);

  if (order.cart_session_id) {
    await conn.query('DELETE FROM cart_sessions WHERE id = ?', [order.cart_session_id]);
  }

  const updated = await Order.findByIdWithItems(orderId, conn);
  events.emit('order.paid', updated);
  return updated;
}

async function cancelOrder(orderId, changedBy, notes) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [orders] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    const order = orders[0];
    if (!order) throw new Error('Order not found');

    if (order.payment_status === 'paid') {
      const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        await inventoryAdapter.restoreStock(
          item.product_id,
          item.quantity,
          order.order_number,
          conn
        );
      }
    }

    await conn.query(
      `UPDATE orders SET status = 'cancelled', payment_status = IF(payment_status = 'paid', 'refunded', payment_status),
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [orderId]
    );
    await Order.addStatusHistory(orderId, order.status, 'cancelled', notes, changedBy, conn);
    await conn.commit();

    const updated = await Order.findByIdWithItems(orderId);
    events.emit('order.cancelled', updated);
    return updated;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { fulfillPaidOrder, cancelOrder };
