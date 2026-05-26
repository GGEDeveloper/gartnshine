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
    `INSERT INTO customers (email, password_hash, first_name, last_name, name, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.email, passwordHash, data.firstName, data.lastName, displayName, data.phone || null]
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

async function getOrdersByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC LIMIT 50',
    [email]
  );
  return rows;
}

module.exports = {
  findByEmail,
  createCustomer,
  findById,
  verifyPassword,
  getOrdersByEmail,
};
