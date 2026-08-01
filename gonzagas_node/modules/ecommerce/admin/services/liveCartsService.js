/**
 * Carrinhos em tempo real (tabela `cart_sessions`).
 *
 * IMPORTANTE: só-leitura. Só faz SELECT — nunca limpa nem altera carrinhos
 * de clientes. A "limpeza" de linhas mortas continua a ser feita pelo fluxo
 * normal da loja, não por este painel.
 */

const { pool } = require('../../../../config/database');
const { getColumns, tableExists } = require('./schemaIntrospect');

/** Um carrinho conta como "activo agora" se foi mexido nos últimos N minutos. */
const ACTIVE_WINDOW_MINUTES = 30;
/** A partir daqui consideramos o carrinho abandonado. */
const ABANDONED_AFTER_HOURS = 24;

function minutesSince(date) {
  if (!date) return null;
  return Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
}

/**
 * Todos os carrinhos com itens, com produtos, valor e identificação possível.
 * @param {{search?:string, filter?:string, limit?:number}} opts
 */
async function getLiveCarts(opts = {}) {
  if (!(await tableExists('cart_sessions'))) {
    return { carts: [], stats: emptyStats(), missingTable: true, generatedAt: new Date() };
  }

  const cartCols = await getColumns('cart_sessions');
  const hasEmail = cartCols.has('customer_email');
  const hasUpdated = cartCols.has('updated_at');
  const hasCreated = cartCols.has('created_at');
  const limit = Math.min(Math.max(1, parseInt(opts.limit, 10) || 200), 500);

  const productCols = await getColumns('products');
  const priceCol = productCols.has('sale_price') ? 'p.sale_price' : productCols.has('price') ? 'p.price' : 'NULL';
  const hasImages = await tableExists('product_images');

  const [rows] = await pool.query(
    `SELECT cs.id AS session_id,
            ${hasEmail ? 'cs.customer_email' : 'NULL AS customer_email'},
            cs.product_id,
            cs.quantity,
            ${hasCreated ? 'cs.created_at' : 'NULL AS created_at'},
            ${hasUpdated ? 'cs.updated_at' : 'NULL AS updated_at'},
            p.reference, p.name AS product_name,
            ${priceCol} AS unit_price,
            ${productCols.has('current_stock') ? 'p.current_stock' : 'NULL AS current_stock'},
            ${productCols.has('is_active') ? 'p.is_active' : '1 AS is_active'}
            ${hasImages
              ? `, (SELECT pi.image_filename FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image_filename`
              : ', NULL AS image_filename'}
     FROM cart_sessions cs
     LEFT JOIN products p ON p.id = cs.product_id
     ORDER BY ${hasUpdated ? 'cs.updated_at' : 'cs.id'} DESC
     LIMIT 5000`
  );

  // Agrupar linhas por sessão
  const bySession = new Map();
  for (const row of rows) {
    let cart = bySession.get(row.session_id);
    if (!cart) {
      cart = {
        sessionId: row.session_id,
        customerEmail: row.customer_email || null,
        items: [],
        units: 0,
        value: 0,
        firstSeen: row.created_at || null,
        lastActivity: row.updated_at || row.created_at || null,
        hasIssues: false,
      };
      bySession.set(row.session_id, cart);
    }

    const qty = parseInt(row.quantity, 10) || 0;
    const unitPrice = row.unit_price === null ? null : parseFloat(row.unit_price);
    const lineTotal = unitPrice === null ? 0 : Math.round(unitPrice * qty * 100) / 100;
    const stock = row.current_stock === null ? null : parseInt(row.current_stock, 10);
    const missingProduct = !row.product_name;
    const inactive = !missingProduct && !row.is_active;
    const overStock = stock !== null && qty > stock;

    cart.items.push({
      productId: row.product_id,
      reference: row.reference || null,
      name: row.product_name || `(produto #${row.product_id} indisponível)`,
      quantity: qty,
      unitPrice,
      lineTotal,
      stock,
      imageFilename: row.image_filename || null,
      missingProduct,
      inactive,
      overStock,
      updatedAt: row.updated_at || null,
    });

    cart.units += qty;
    cart.value = Math.round((cart.value + lineTotal) * 100) / 100;
    if (missingProduct || inactive || overStock) cart.hasIssues = true;
    if (row.created_at && (!cart.firstSeen || new Date(row.created_at) < new Date(cart.firstSeen))) {
      cart.firstSeen = row.created_at;
    }
    if (row.updated_at && (!cart.lastActivity || new Date(row.updated_at) > new Date(cart.lastActivity))) {
      cart.lastActivity = row.updated_at;
    }
  }

  let carts = Array.from(bySession.values());

  // Tentar identificar sessões anónimas através de encomendas antigas com o mesmo cart_session_id
  await attachIdentitiesFromOrders(carts);
  await attachCustomerRecords(carts);

  carts.forEach((cart) => {
    cart.idleMinutes = minutesSince(cart.lastActivity);
    cart.isActive = cart.idleMinutes !== null && cart.idleMinutes <= ACTIVE_WINDOW_MINUTES;
    cart.isAbandoned = cart.idleMinutes !== null && cart.idleMinutes > ABANDONED_AFTER_HOURS * 60;
    cart.isIdentified = !!(cart.customerEmail || cart.customerName);
  });

  const stats = buildStats(carts);

  // Filtros de apresentação (aplicados em memória — nada toca na BD)
  const search = (opts.search || '').trim().toLowerCase();
  if (search) {
    carts = carts.filter(
      (c) =>
        (c.customerEmail || '').toLowerCase().includes(search) ||
        (c.customerName || '').toLowerCase().includes(search) ||
        c.sessionId.toLowerCase().includes(search) ||
        c.items.some(
          (i) =>
            (i.name || '').toLowerCase().includes(search) ||
            (i.reference || '').toLowerCase().includes(search)
        )
    );
  }
  if (opts.filter === 'active') carts = carts.filter((c) => c.isActive);
  else if (opts.filter === 'identified') carts = carts.filter((c) => c.isIdentified);
  else if (opts.filter === 'abandoned') carts = carts.filter((c) => c.isAbandoned);

  carts.sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0));

  return {
    carts: carts.slice(0, limit),
    stats,
    missingTable: false,
    generatedAt: new Date(),
    activeWindowMinutes: ACTIVE_WINDOW_MINUTES,
  };
}

function emptyStats() {
  return { carts: 0, activeNow: 0, identified: 0, anonymous: 0, units: 0, value: 0, abandoned: 0, topProducts: [] };
}

function buildStats(carts) {
  const stats = emptyStats();
  const productCount = new Map();

  for (const cart of carts) {
    stats.carts += 1;
    stats.units += cart.units;
    stats.value = Math.round((stats.value + cart.value) * 100) / 100;
    if (cart.isActive) stats.activeNow += 1;
    if (cart.isIdentified) stats.identified += 1;
    else stats.anonymous += 1;
    if (cart.isAbandoned) stats.abandoned += 1;

    for (const item of cart.items) {
      const key = item.productId;
      const entry = productCount.get(key) || {
        productId: key,
        name: item.name,
        reference: item.reference,
        units: 0,
        carts: 0,
      };
      entry.units += item.quantity;
      entry.carts += 1;
      productCount.set(key, entry);
    }
  }

  stats.topProducts = Array.from(productCount.values())
    .sort((a, b) => b.units - a.units || b.carts - a.carts)
    .slice(0, 8);

  return stats;
}

/** Preenche nome/email a partir de encomendas que usaram a mesma sessão de carrinho. */
async function attachIdentitiesFromOrders(carts) {
  const unknown = carts.filter((c) => !c.customerEmail).map((c) => c.sessionId);
  if (!unknown.length) return;

  const orderCols = await getColumns('orders');
  if (!orderCols.has('cart_session_id') || !orderCols.has('customer_email')) return;

  try {
    const [rows] = await pool.query(
      `SELECT cart_session_id,
              MAX(customer_email) AS customer_email
              ${orderCols.has('customer_name') ? ', MAX(customer_name) AS customer_name' : ''}
       FROM orders
       WHERE cart_session_id IN (?)
       GROUP BY cart_session_id`,
      [unknown]
    );
    const map = new Map(rows.map((r) => [r.cart_session_id, r]));
    carts.forEach((cart) => {
      const match = map.get(cart.sessionId);
      if (match) {
        cart.customerEmail = cart.customerEmail || match.customer_email || null;
        cart.customerName = cart.customerName || match.customer_name || null;
        cart.identitySource = 'encomenda anterior';
      }
    });
  } catch (err) {
    console.warn('[admin/carrinhos] Falha ao cruzar com encomendas:', err.message);
  }
}

/** Liga cada email a um cliente registado (id + nome), se existir. */
async function attachCustomerRecords(carts) {
  const emails = [...new Set(carts.map((c) => c.customerEmail).filter(Boolean))];
  if (!emails.length) return;

  const cols = await getColumns('customers');
  if (!cols.size) return;

  const nameParts = [];
  if (cols.has('first_name')) nameParts.push("COALESCE(first_name,'')");
  if (cols.has('last_name')) nameParts.push("COALESCE(last_name,'')");
  const nameExpr = nameParts.length
    ? `NULLIF(TRIM(CONCAT_WS(' ', ${nameParts.join(', ')})), '')`
    : cols.has('name')
      ? 'name'
      : 'NULL';

  try {
    const [rows] = await pool.query(
      `SELECT id, LOWER(email) AS email, ${nameExpr} AS display_name FROM customers WHERE email IN (?)`,
      [emails]
    );
    const map = new Map(rows.map((r) => [r.email, r]));
    carts.forEach((cart) => {
      if (!cart.customerEmail) return;
      const match = map.get(cart.customerEmail.toLowerCase());
      if (match) {
        cart.customerId = match.id;
        cart.customerName = match.display_name || cart.customerName || null;
        cart.identitySource = cart.identitySource || 'conta registada';
      }
    });
  } catch (err) {
    console.warn('[admin/carrinhos] Falha ao cruzar com clientes:', err.message);
  }
}

/** Carrinhos associados a um email (usado na ficha do cliente). */
async function getCartsForEmail(email) {
  if (!email) return [];
  const { carts } = await getLiveCarts({ limit: 500 });
  return carts.filter((c) => (c.customerEmail || '').toLowerCase() === email.toLowerCase());
}

module.exports = {
  getLiveCarts,
  getCartsForEmail,
  ACTIVE_WINDOW_MINUTES,
  ABANDONED_AFTER_HOURS,
};
