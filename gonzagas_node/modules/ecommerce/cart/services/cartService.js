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

/**
 * @param {string} sessionId
 * @param {number} productId
 * @param {number} quantity
 * @param {string|null} customerEmail Email do cliente autenticado, se houver.
 *   Tem de vir já na inserção: uma linha acrescentada depois do login que
 *   ficasse sem email não seria reconhecida como pertencendo ao cliente.
 */
async function addItem(sessionId, productId, quantity, customerEmail = null) {
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
      'INSERT INTO cart_sessions (id, customer_email, product_id, quantity) VALUES (?, ?, ?, ?)',
      [sessionId, customerEmail || null, productId, qty]
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
 * Ao entrar na conta, o carrinho que a pessoa montou como visitante passa a ser
 * dela, e junta-se ao que já tivesse de sessões anteriores (outro dispositivo,
 * outro browser, ou antes de a sessão expirar).
 *
 * As quantidades somam-se, com o stock disponível como tecto — nunca se cria
 * um carrinho impossível de finalizar. As sessões antigas são apagadas depois
 * de absorvidas, para o cliente não ficar com o mesmo carrinho em dois sítios.
 *
 * Nunca lança: se a junção falhar, o cliente fica com o carrinho actual
 * intacto, que é o comportamento de hoje.
 */
async function mergeSessionsForCustomer(currentSessionId, email) {
  if (!currentSessionId || !email) return { merged: 0, sessionsAbsorbed: 0 };

  try {
    await tagSessionCustomer(currentSessionId, email);
    if (!cartHasEmailColumn) return { merged: 0, sessionsAbsorbed: 0 };

    // Primeiro identificar as sessões antigas do cliente, e só depois ler
    // TODAS as linhas dessas sessões. Ler apenas as linhas com o email
    // preenchido levaria a absorver umas e apagar outras — o carrinho antigo é
    // apagado por sessão, portanto tem de ser lido por sessão.
    const [oldSessions] = await pool.query(
      'SELECT DISTINCT id FROM cart_sessions WHERE customer_email = ? AND id <> ?',
      [email, currentSessionId]
    );
    if (!oldSessions.length) return { merged: 0, sessionsAbsorbed: 0 };

    const oldSessionIds = oldSessions.map((r) => r.id);
    const [oldRows] = await pool.query(
      'SELECT id, product_id, quantity FROM cart_sessions WHERE id IN (?)',
      [oldSessionIds]
    );
    if (!oldRows.length) return { merged: 0, sessionsAbsorbed: 0 };

    const [currentRows] = await pool.query(
      'SELECT product_id, quantity FROM cart_sessions WHERE id = ?',
      [currentSessionId]
    );
    const currentByProduct = new Map(currentRows.map((r) => [r.product_id, r.quantity]));

    // Somar as quantidades das sessões antigas por produto
    const incoming = new Map();
    for (const row of oldRows) {
      incoming.set(row.product_id, (incoming.get(row.product_id) || 0) + (row.quantity || 0));
    }

    let merged = 0;
    for (const [productId, qty] of incoming) {
      const product = await productAdapter.findByIdForCart(productId);
      if (!product || !product.isActive || product.currentStock <= 0) continue;

      const wanted = (currentByProduct.get(productId) || 0) + qty;
      const capped = Math.min(wanted, product.currentStock);
      if (capped <= 0) continue;

      if (currentByProduct.has(productId)) {
        if (capped === currentByProduct.get(productId)) continue; // já estava no tecto
        await pool.query(
          'UPDATE cart_sessions SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND product_id = ?',
          [capped, currentSessionId, productId]
        );
      } else {
        await pool.query(
          'INSERT INTO cart_sessions (id, customer_email, product_id, quantity) VALUES (?, ?, ?, ?)',
          [currentSessionId, email, productId, capped]
        );
      }
      merged += 1;
    }

    await pool.query('DELETE FROM cart_sessions WHERE id IN (?)', [oldSessionIds]);

    return { merged, sessionsAbsorbed: oldSessionIds.length };
  } catch (err) {
    console.warn('[cart] Não foi possível juntar os carrinhos do cliente:', err.message);
    return { merged: 0, sessionsAbsorbed: 0 };
  }
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
  mergeSessionsForCustomer,
};
