const { pool } = require('../../../../config/database');

async function getActiveMethods(settings) {
  const [rows] = await pool.query(
    'SELECT * FROM shipping_methods WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );
  if (!settings) return rows;

  // O preço apresentado tem de refletir o que está definido em
  // ecommerce_settings (admin), não o valor estático gravado em
  // shipping_methods.price — caso contrário o rádio de seleção mostra um
  // valor diferente do resumo de totais, que já usa o override da settings.
  return rows.map((row) => {
    if (row.code === 'standard' && settings.standard_shipping_cost != null) {
      return { ...row, price: parseFloat(settings.standard_shipping_cost) };
    }
    if (row.code === 'express' && settings.express_shipping_cost != null) {
      return { ...row, price: parseFloat(settings.express_shipping_cost) };
    }
    return row;
  });
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
