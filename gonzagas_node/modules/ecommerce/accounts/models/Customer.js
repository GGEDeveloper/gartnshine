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

async function findByGoogleId(googleId) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE google_id = ? LIMIT 1', [googleId]);
  return rows[0] || null;
}

async function findOrCreateByGoogle({ googleId, email, firstName, lastName, avatarUrl }) {
  // 1. Já existe conta com este google_id
  let customer = await findByGoogleId(googleId);
  if (customer) {
    // Actualizar avatar se mudou
    if (avatarUrl && avatarUrl !== customer.avatar_url) {
      await pool.query('UPDATE customers SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        avatarUrl,
        customer.id,
      ]);
    }
    return findById(customer.id);
  }

  // 2. Conta local com o mesmo email — ligar Google
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

  // 3. Criar conta nova via Google
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || null;
  const [result] = await pool.query(
    `INSERT INTO customers (email, google_id, auth_provider, avatar_url, first_name, last_name, name)
     VALUES (?, ?, 'google', ?, ?, ?, ?)`,
    [email || null, googleId, avatarUrl, firstName, lastName, displayName]
  );
  return findById(result.insertId);
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
  findByGoogleId,
  findOrCreateByGoogle,
  createCustomer,
  findById,
  verifyPassword,
  getOrdersByEmail,
};
