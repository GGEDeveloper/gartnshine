const { pool } = require('../../../../config/database');
const productAdapter = require('../../adapters/productAdapter');
const moduleConfig = require('../../config');
const { generateCartSessionId } = require('../../orders/services/orderNumberService');

async function getSessionItems(sessionId) {
  const [rows] = await pool.query(
    'SELECT product_id, quantity FROM cart_sessions WHERE id = ? ORDER BY updated_at DESC',
    [sessionId]
  );
  return rows;
}

async function enrichItems(rows) {
  const items = [];
  const toRemove = [];

  for (const row of rows) {
    const product = await productAdapter.findByIdForCart(row.product_id);
    if (!product || !product.isActive) {
      toRemove.push(row.product_id);
      continue;
    }
    const qty = Math.min(parseInt(row.quantity, 10) || 1, product.currentStock || 0);
    if (qty <= 0) {
      toRemove.push(row.product_id);
      continue;
    }
    items.push({
      productId: product.id,
      reference: product.reference,
      name: product.name,
      unitPrice: product.salePrice,
      basePrice: product.basePrice,
      taxRate: product.taxRate,
      quantity: qty,
      totalPrice: Math.round(product.salePrice * qty * 100) / 100,
      imageFilename: product.imageFilename,
      maxStock: product.currentStock,
    });
  }

  // Limpar itens esgotados/inactivos da BD (para não acumular entradas mortas)
  if (toRemove.length && rows.length > 0) {
    const sessionId = rows[0]?.id || null;
    if (sessionId) {
      for (const pid of toRemove) {
        await pool.query('DELETE FROM cart_sessions WHERE id = ? AND product_id = ?', [sessionId, pid]).catch(() => {});
      }
    }
  }

  return items;
}

async function getCart(sessionId) {
  const rows = await getSessionItems(sessionId);
  const items = await enrichItems(rows);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  return { sessionId, items, itemCount };
}

async function addItem(sessionId, productId, quantity) {
  const product = await productAdapter.findByIdForCart(productId);
  if (!product || !product.isActive) throw new Error('Produto indisponível');
  if (product.currentStock <= 0) throw new Error('Produto esgotado');

  const qty = Math.min(Math.max(1, parseInt(quantity, 10) || 1), product.currentStock);

  const [existing] = await pool.query(
    'SELECT quantity FROM cart_sessions WHERE id = ? AND product_id = ? LIMIT 1',
    [sessionId, productId]
  );

  if (existing.length) {
    const newQty = Math.min(existing[0].quantity + qty, product.currentStock);
    await pool.query(
      'UPDATE cart_sessions SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND product_id = ?',
      [newQty, sessionId, productId]
    );
  } else {
    await pool.query(
      'INSERT INTO cart_sessions (id, product_id, quantity) VALUES (?, ?, ?)',
      [sessionId, productId, qty]
    );
  }

  return getCart(sessionId);
}

async function updateItem(sessionId, productId, quantity) {
  const product = await productAdapter.findByIdForCart(productId);
  if (!product || !product.isActive) throw new Error('Produto indisponível');

  const qty = parseInt(quantity, 10);
  if (!qty || qty <= 0) {
    await removeItem(sessionId, productId);
    return getCart(sessionId);
  }

  const capped = Math.min(qty, product.currentStock);
  await pool.query(
    'UPDATE cart_sessions SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND product_id = ?',
    [capped, sessionId, productId]
  );
  return getCart(sessionId);
}

async function removeItem(sessionId, productId) {
  await pool.query('DELETE FROM cart_sessions WHERE id = ? AND product_id = ?', [
    sessionId,
    productId,
  ]);
  return getCart(sessionId);
}

async function clearSession(sessionId) {
  await pool.query('DELETE FROM cart_sessions WHERE id = ?', [sessionId]);
}

/**
 * Associa a sessão de carrinho ao email do cliente autenticado, para que o
 * painel de admin consiga mostrar de quem é cada carrinho. Só preenche a
 * coluna `customer_email` (nunca mexe nos itens) e preserva `updated_at`
 * para não falsear a "última actividade" do carrinho.
 */
let cartHasEmailColumn = null;
async function tagSessionCustomer(sessionId, email) {
  if (!sessionId || !email) return;
  try {
    if (cartHasEmailColumn === null) {
      const [cols] = await pool.query(
        `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cart_sessions' AND COLUMN_NAME = 'customer_email'`
      );
      cartHasEmailColumn = (cols[0]?.n || 0) > 0;
    }
    if (!cartHasEmailColumn) return;

    await pool.query(
      `UPDATE cart_sessions SET customer_email = ?, updated_at = updated_at
       WHERE id = ? AND (customer_email IS NULL OR customer_email <> ?)`,
      [email, sessionId, email]
    );
  } catch (err) {
    // Nunca deixar isto quebrar o carrinho do cliente
    console.warn('[cart] Não foi possível associar o carrinho ao cliente:', err.message);
  }
}

function ensureSessionId(req, res) {
  let sessionId = req.cookies?.[moduleConfig.cartCookieName];
  if (!sessionId) {
    sessionId = generateCartSessionId();
    res.cookie(moduleConfig.cartCookieName, sessionId, {
      httpOnly: true,
      maxAge: moduleConfig.cartCookieMaxAgeMs,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return sessionId;
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearSession,
  ensureSessionId,
  tagSessionCustomer,
};
