const bcrypt = require('bcryptjs');
const { pool } = require('../../../../config/database');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function createCustomer(data) {
  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
  const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim() || null;
  const [result] = await pool.query(
    `INSERT INTO customers (email, password_hash, first_name, last_name, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.email, passwordHash, data.firstName, data.lastName, data.phone || null]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function verifyPassword(customer, password) {
  if (!customer?.password_hash) return false;
  return bcrypt.compare(password, customer.password_hash);
}

async function findByGoogleId(googleId) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE google_id = ? LIMIT 1', [googleId]);
  return rows[0] || null;
}

async function findOrCreateByGoogle({ googleId, email, firstName, lastName, avatarUrl }) {
  let customer = await findByGoogleId(googleId);
  if (customer) {
    if (avatarUrl && avatarUrl !== customer.avatar_url) {
      await pool.query('UPDATE customers SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        avatarUrl,
        customer.id,
      ]);
    }
    return findById(customer.id);
  }

  if (email) {
    customer = await findByEmail(email);
    if (customer) {
      await pool.query(
        "UPDATE customers SET google_id = ?, avatar_url = COALESCE(?, avatar_url), auth_provider = 'both', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [googleId, avatarUrl, customer.id]
      );
      return findById(customer.id);
    }
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || null;
  const [result] = await pool.query(
    `INSERT INTO customers (email, google_id, auth_provider, avatar_url, first_name, last_name)
     VALUES (?, ?, 'google', ?, ?, ?, ?)`,
    [email || null, googleId, avatarUrl, firstName, lastName]
  );
  return findById(result.insertId);
}

async function getOrdersByEmail(email) {
  const [rows] = await pool.query(
    `SELECT o.*,
            COUNT(oi.id) AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.customer_email = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT 20`,
    [email]
  );
  return rows;
}

async function getOrderByIdForEmail(orderId, email) {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE id = ? AND customer_email = ? LIMIT 1',
    [orderId, email]
  );
  return rows[0] || null;
}

async function getOrderItems(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC',
    [orderId]
  );
  return rows;
}

async function updateProfile(id, data) {
  const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim() || null;
  await pool.query(
    `UPDATE customers SET
       first_name = ?,
       last_name = ?,
       name = ?,
       phone = ?,
       billing_address_line1 = ?,
       billing_city = ?,
       billing_postal_code = ?,
       billing_country = ?,
       shipping_address_line1 = ?,
       shipping_city = ?,
       shipping_postal_code = ?,
       shipping_country = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      data.firstName || null,
      data.lastName || null,
      displayName,
      data.phone || null,
      data.billingAddressLine1 || null,
      data.billingCity || null,
      data.billingPostalCode || null,
      data.billingCountry || 'Portugal',
      data.shippingAddressLine1 || null,
      data.shippingCity || null,
      data.shippingPostalCode || null,
      data.shippingCountry || 'Portugal',
      id,
    ]
  );
  return findById(id);
}

async function changePassword(id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    'UPDATE customers SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [passwordHash, id]
  );
  return findById(id);
}

module.exports = {
  findByEmail,
  findByGoogleId,
  findOrCreateByGoogle,
  createCustomer,
  findById,
  verifyPassword,
  getOrdersByEmail,
  getOrderByIdForEmail,
  getOrderItems,
  updateProfile,
  changePassword,
};
