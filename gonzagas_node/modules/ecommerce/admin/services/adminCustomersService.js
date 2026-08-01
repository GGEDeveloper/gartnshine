/**
 * Dados para o painel de Clientes & Utilizadores do admin.
 *
 * IMPORTANTE: este serviço é 100% só-leitura (apenas SELECT). Não altera,
 * não apaga e não cria nada na base de dados.
 */

const { pool } = require('../../../../config/database');
const { getColumns, tableExists } = require('./schemaIntrospect');

const DEFAULT_PER_PAGE = 25;

/** Expressão SQL para o nome do cliente, conforme as colunas existentes. */
function buildNameExpr(cols) {
  if (cols.has('first_name') || cols.has('last_name')) {
    const parts = [];
    if (cols.has('first_name')) parts.push("COALESCE(c.first_name,'')");
    if (cols.has('last_name')) parts.push("COALESCE(c.last_name,'')");
    return `NULLIF(TRIM(CONCAT_WS(' ', ${parts.join(', ')})), '')`;
  }
  if (cols.has('name')) return 'c.name';
  return 'NULL';
}

/**
 * Lista de clientes registados, com métricas de encomendas por email.
 * @param {{search?:string, page?:number, perPage?:number, sort?:string}} opts
 */
async function listCustomers(opts = {}) {
  const cols = await getColumns('customers');
  if (!cols.size) {
    return { customers: [], total: 0, page: 1, perPage: DEFAULT_PER_PAGE, pages: 0, missingTable: true };
  }

  const page = Math.max(1, parseInt(opts.page, 10) || 1);
  const perPage = Math.min(Math.max(1, parseInt(opts.perPage, 10) || DEFAULT_PER_PAGE), 200);
  const offset = (page - 1) * perPage;

  const params = [];
  let where = '1=1';

  // Não mostrar clientes apagados por soft delete, se essa coluna existir
  if (cols.has('deleted_at')) where += ' AND c.deleted_at IS NULL';

  const search = (opts.search || '').trim();
  if (search) {
    const searchable = ['email', 'first_name', 'last_name', 'name', 'phone'].filter((f) => cols.has(f));
    if (searchable.length) {
      where += ` AND (${searchable.map((f) => `c.${f} LIKE ?`).join(' OR ')})`;
      searchable.forEach(() => params.push(`%${search}%`));
    }
  }

  const createdCol = cols.has('created_at') ? 'created_at' : null;
  const sortMap = {
    recent: createdCol ? `c.${createdCol} DESC` : 'c.id DESC',
    oldest: createdCol ? `c.${createdCol} ASC` : 'c.id ASC',
    email: 'c.email ASC',
  };
  const orderBy = sortMap[opts.sort] || sortMap.recent;

  const nameExpr = buildNameExpr(cols);

  const [rows] = await pool.query(
    `SELECT c.*, ${nameExpr} AS display_name
     FROM customers c
     WHERE ${where}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM customers c WHERE ${where}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const statsByEmail = await getOrderStatsForEmails(rows.map((r) => r.email).filter(Boolean));
  const cartsByEmail = await getCartFlagsForEmails(rows.map((r) => r.email).filter(Boolean));

  const customers = rows.map((r) => {
    const stats = statsByEmail.get((r.email || '').toLowerCase()) || null;
    return {
      ...r,
      display_name: r.display_name || null,
      provider: r.auth_provider || (r.google_id ? 'google' : 'local'),
      orders_count: stats?.orders_count || 0,
      orders_total: stats?.orders_total || 0,
      last_order_at: stats?.last_order_at || null,
      has_active_cart: cartsByEmail.has((r.email || '').toLowerCase()),
    };
  });

  return { customers, total, page, perPage, pages: Math.ceil(total / perPage) || 0, missingTable: false };
}

/** Agrega encomendas por email (tolerante à ausência da tabela orders). */
async function getOrderStatsForEmails(emails) {
  const map = new Map();
  if (!emails.length) return map;
  const orderCols = await getColumns('orders');
  if (!orderCols.has('customer_email')) return map;

  const hasTotal = orderCols.has('total_amount');
  const hasPaymentStatus = orderCols.has('payment_status');
  const hasCreated = orderCols.has('created_at');

  try {
    const [rows] = await pool.query(
      `SELECT LOWER(customer_email) AS email,
              COUNT(*) AS orders_count,
              ${hasTotal
                ? hasPaymentStatus
                  ? "COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0)"
                  : 'COALESCE(SUM(total_amount), 0)'
                : '0'} AS orders_total,
              ${hasCreated ? 'MAX(created_at)' : 'NULL'} AS last_order_at
       FROM orders
       WHERE customer_email IN (?)
       GROUP BY LOWER(customer_email)`,
      [emails]
    );
    rows.forEach((r) => {
      map.set(r.email, {
        orders_count: r.orders_count,
        orders_total: parseFloat(r.orders_total || 0),
        last_order_at: r.last_order_at,
      });
    });
  } catch (err) {
    console.warn('[admin/clientes] Falha ao agregar encomendas:', err.message);
  }
  return map;
}

/** Emails que têm neste momento um carrinho identificado com itens. */
async function getCartFlagsForEmails(emails) {
  const set = new Set();
  if (!emails.length) return set;
  const cartCols = await getColumns('cart_sessions');
  if (!cartCols.has('customer_email')) return set;

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT LOWER(customer_email) AS email
       FROM cart_sessions
       WHERE customer_email IN (?)`,
      [emails]
    );
    rows.forEach((r) => set.add(r.email));
  } catch (err) {
    console.warn('[admin/clientes] Falha ao verificar carrinhos:', err.message);
  }
  return set;
}

/** KPIs do topo do painel. */
async function getCustomerStats() {
  const cols = await getColumns('customers');
  if (!cols.size) return null;

  const softDelete = cols.has('deleted_at') ? 'WHERE deleted_at IS NULL' : '';
  const hasCreated = cols.has('created_at');
  const hasGoogle = cols.has('google_id');
  const hasActive = cols.has('is_active');
  const hasPassword = cols.has('password_hash');

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total,
            ${hasCreated ? 'SUM(created_at >= NOW() - INTERVAL 7 DAY)' : '0'} AS new_7d,
            ${hasCreated ? 'SUM(created_at >= NOW() - INTERVAL 30 DAY)' : '0'} AS new_30d,
            ${hasGoogle ? 'SUM(google_id IS NOT NULL)' : '0'} AS with_google,
            ${hasPassword ? 'SUM(password_hash IS NOT NULL)' : '0'} AS with_password,
            ${hasActive ? 'SUM(is_active = 0)' : '0'} AS inactive
     FROM customers ${softDelete}`
  );

  const r = rows[0] || {};
  return {
    total: Number(r.total || 0),
    new7d: Number(r.new_7d || 0),
    new30d: Number(r.new_30d || 0),
    withGoogle: Number(r.with_google || 0),
    withPassword: Number(r.with_password || 0),
    inactive: Number(r.inactive || 0),
    hasCreated,
  };
}

/** Utilizadores do backoffice (tabela `users`). Nunca devolve passwords. */
async function listAdminUsers() {
  const cols = await getColumns('users');
  if (!cols.size) return [];

  const safe = ['id', 'name', 'username', 'email', 'role', 'is_active', 'last_login', 'created_at', 'updated_at']
    .filter((c) => cols.has(c));
  if (!safe.length) return [];

  const orderBy = cols.has('created_at') ? 'created_at DESC' : 'id DESC';
  try {
    const [rows] = await pool.query(
      `SELECT ${safe.map((c) => `\`${c}\``).join(', ')} FROM users ORDER BY ${orderBy} LIMIT 200`
    );
    return rows;
  } catch (err) {
    console.warn('[admin/clientes] Falha ao listar utilizadores:', err.message);
    return [];
  }
}

/** Ficha de um cliente: dados, encomendas e carrinho actual. */
async function getCustomerDetail(id) {
  const cols = await getColumns('customers');
  if (!cols.size) return null;

  const nameExpr = buildNameExpr(cols);
  const [rows] = await pool.query(
    `SELECT c.*, ${nameExpr} AS display_name FROM customers c WHERE c.id = ? LIMIT 1`,
    [id]
  );
  const customer = rows[0];
  if (!customer) return null;

  customer.provider = customer.auth_provider || (customer.google_id ? 'google' : 'local');

  let orders = [];
  if (customer.email && (await getColumns('orders')).has('customer_email')) {
    try {
      const orderCols = await getColumns('orders');
      const orderBy = orderCols.has('created_at') ? 'created_at DESC' : 'id DESC';
      const [orderRows] = await pool.query(
        `SELECT * FROM orders WHERE LOWER(customer_email) = LOWER(?) ORDER BY ${orderBy} LIMIT 100`,
        [customer.email]
      );
      orders = orderRows;
    } catch (err) {
      console.warn('[admin/clientes] Falha ao carregar encomendas do cliente:', err.message);
    }
  }

  let carts = [];
  if (customer.email && (await tableExists('cart_sessions'))) {
    const liveCarts = require('./liveCartsService');
    carts = await liveCarts.getCartsForEmail(customer.email);
  }

  return { customer, orders, carts };
}

module.exports = {
  listCustomers,
  getCustomerStats,
  listAdminUsers,
  getCustomerDetail,
};
