const { pool } = require('../../../../config/database');

async function getActiveMethods() {
  const [rows] = await pool.query(
    'SELECT * FROM shipping_methods WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

async function getByCode(code) {
  const [rows] = await pool.query(
    'SELECT * FROM shipping_methods WHERE code = ? AND is_active = 1 LIMIT 1',
    [code]
  );
  return rows[0] || null;
}

async function calculateShippingCost(methodCode, cartSubtotal, settings) {
  const method = await getByCode(methodCode);
  if (!method) return { cost: 0, method: null };

  const threshold = parseFloat(settings.free_shipping_threshold ?? 75);
  const subtotal = parseFloat(cartSubtotal) || 0;

  if (method.code !== 'pickup' && subtotal >= threshold) {
    return { cost: 0, method, freeShippingApplied: true };
  }

  let cost = parseFloat(method.price) || 0;
  if (method.code === 'standard') {
    cost = parseFloat(settings.standard_shipping_cost ?? cost);
  } else if (method.code === 'express') {
    cost = parseFloat(settings.express_shipping_cost ?? cost);
  }

  return { cost, method, freeShippingApplied: false };
}

module.exports = {
  getActiveMethods,
  getByCode,
  calculateShippingCost,
};
