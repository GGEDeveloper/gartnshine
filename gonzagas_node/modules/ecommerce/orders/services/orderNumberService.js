const crypto = require('crypto');
const { pool } = require('../../../../config/database');

async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  const [rows] = await pool.query(
    `SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let seq = 1;
  if (rows.length) {
    const last = rows[0].order_number;
    const part = parseInt(last.replace(prefix, ''), 10);
    if (!Number.isNaN(part)) seq = part + 1;
  }

  return `${prefix}${String(seq).padStart(5, '0')}`;
}

function generateCartSessionId() {
  return crypto.randomUUID();
}

module.exports = { generateOrderNumber, generateCartSessionId };
