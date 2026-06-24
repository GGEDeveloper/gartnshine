const { pool } = require('../../../../config/database');
const orderNumberService = require('../services/orderNumberService');

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function findByOrderNumber(orderNumber) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE order_number = ? LIMIT 1', [
    orderNumber,
  ]);
  return rows[0] || null;
}

async function getItems(orderId) {
  const [rows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return rows;
}

async function addStatusHistory(orderId, oldStatus, newStatus, notes, changedBy, connection) {
  const conn = connection || pool;
  await conn.query(
    `INSERT INTO order_status_history (order_id, old_status, new_status, notes, changed_by)
     VALUES (?, ?, ?, ?, ?)`,
    [orderId, oldStatus, newStatus, notes || null, changedBy || 'system']
  );
}

async function createFromCheckout(data, items, connection) {
  const conn = connection || pool;
  const orderNumber = await orderNumberService.generateOrderNumber();

  const [result] = await conn.query(
    `INSERT INTO orders (
      order_number, customer_email, customer_name, customer_phone,
      billing_address_line1, billing_address_line2, billing_city, billing_postal_code, billing_country,
      shipping_address_line1, shipping_address_line2, shipping_city, shipping_postal_code, shipping_country,
      shipping_method_code, subtotal, tax_amount, shipping_amount, total_amount, currency,
      status, payment_status, payment_method, notes, cart_session_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?)`,
    [
      orderNumber,
      data.customerEmail,
      data.customerName,
      data.customerPhone || null,
      data.billingAddressLine1,
      data.billingAddressLine2 || null,
      data.billingCity,
      data.billingPostalCode,
      data.billingCountry || 'Portugal',
      data.shippingAddressLine1,
      data.shippingAddressLine2 || null,
      data.shippingCity,
      data.shippingPostalCode,
      data.shippingCountry || 'Portugal',
      data.shippingMethodCode,
      data.subtotal,
      data.taxAmount,
      data.shippingAmount,
      data.totalAmount,
      data.currency || 'EUR',
      data.paymentMethod || null,
      data.notes || null,
      data.cartSessionId || null,
    ]
  );

  const orderId = result.insertId;

  for (const item of items) {
    await conn.query(
      `INSERT INTO order_items
       (order_id, product_id, product_reference, quantity, unit_price, base_price, total_price, product_name, product_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        item.productId,
        item.reference,
        item.quantity,
        item.unitPrice,
        item.basePrice,
        item.totalPrice,
        item.name,
        item.imageFilename,
      ]
    );
  }

  await addStatusHistory(orderId, null, 'pending', 'Order created', 'checkout', conn);

  return findByIdWithItems(orderId, conn);
}

async function findByIdWithItems(orderId, connection) {
  const conn = connection || pool;
  const [orderRows] = await conn.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);
  const order = orderRows[0] || null;
  if (!order) return null;
  const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return { ...order, items };
}

async function updateStatus(orderId, newStatus, changedBy, notes) {
  const order = await findById(orderId);
  if (!order) throw new Error('Order not found');

  const updates = { status: newStatus };
  if (newStatus === 'shipped') updates.shipped_at = new Date();
  if (newStatus === 'delivered') updates.delivered_at = new Date();

  await pool.query(
    `UPDATE orders SET status = ?, shipped_at = COALESCE(?, shipped_at),
     delivered_at = COALESCE(?, delivered_at), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [newStatus, updates.shipped_at || null, updates.delivered_at || null, orderId]
  );

  await addStatusHistory(orderId, order.status, newStatus, notes, changedBy);
  return findById(orderId);
}

async function updatePaymentStatus(orderId, paymentStatus, paymentReference, connection) {
  const conn = connection || pool;
  await conn.query(
    `UPDATE orders SET payment_status = ?, payment_reference = COALESCE(?, payment_reference),
     updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [paymentStatus, paymentReference || null, orderId]
  );
}

async function list(filters = {}) {
  let where = '1=1';
  const params = [];

  if (filters.status) {
    where += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.paymentStatus) {
    where += ' AND payment_status = ?';
    params.push(filters.paymentStatus);
  }
  if (filters.search) {
    where += ' AND (order_number LIKE ? OR customer_email LIKE ? OR customer_name LIKE ?)';
    const q = `%${filters.search}%`;
    params.push(q, q, q);
  }

  const limit = Math.min(parseInt(filters.limit, 10) || 50, 200);
  const offset = parseInt(filters.offset, 10) || 0;

  const [rows] = await pool.query(
    `SELECT * FROM orders WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM orders WHERE ${where}`,
    params
  );

  return { orders: rows, total: countRows[0].total };
}

async function getDashboardStats() {
  const [orderStats] = await pool.query(
    `SELECT COUNT(*) AS orderCount,
            COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) AS revenue
     FROM orders`
  );
  return {
    orders: orderStats[0].orderCount || 0,
    revenue: parseFloat(orderStats[0].revenue || 0).toFixed(2),
  };
}

module.exports = {
  findById,
  findByOrderNumber,
  getItems,
  createFromCheckout,
  findByIdWithItems,
  updateStatus,
  updatePaymentStatus,
  addStatusHistory,
  list,
  getDashboardStats,
};
