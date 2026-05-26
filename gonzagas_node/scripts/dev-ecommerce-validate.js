#!/usr/bin/env node
/**
 * Validação e-commerce em dev — correr com servidor activo (npm start).
 * Uso: node scripts/dev-ecommerce-validate.js [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3000';

const results = [];
let cookieJar = '';

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const icon = ok ? '✓' : '✗';
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ''}`);
}

function parseSetCookie(headers) {
  const raw = headers.getSetCookie ? headers.getSetCookie() : [headers.get('set-cookie')].filter(Boolean);
  const pairs = [];
  for (const line of raw) {
    if (!line) continue;
    const part = (Array.isArray(line) ? line[0] : line).split(';')[0];
    if (part) pairs.push(part);
  }
  if (!pairs.length) return;
  const map = Object.fromEntries(cookieJar.split('; ').filter(Boolean).map((c) => c.split('=')));
  for (const p of pairs) {
    const [k, ...v] = p.split('=');
    map[k] = v.join('=');
  }
  cookieJar = Object.entries(map)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

async function req(method, path, body) {
  const opts = {
    method,
    headers: { Accept: 'application/json, text/html' },
    redirect: 'manual',
  };
  if (cookieJar) opts.headers.Cookie = cookieJar;
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, opts);
  parseSetCookie(res.headers);
  const ct = res.headers.get('content-type') || '';
  let data = null;
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, data, headers: res.headers };
}

async function main() {
  console.log(`\n=== E-commerce dev validation @ ${BASE} ===\n`);

  // Health
  let r = await req('GET', '/');
  record('GET /', r.status === 200 || r.status === 302, `status ${r.status}`);

  // Cart empty
  r = await req('GET', '/api/cart');
  record('GET /api/cart', r.status === 200 && r.data.success, `items=${r.data?.cart?.itemCount ?? '?'}`);

  // Pages
  for (const path of ['/cart', '/checkout', '/account/login', '/account/register']) {
    r = await req('GET', path);
    const expect = path === '/checkout' ? [200, 302] : [200];
    record(`GET ${path}`, expect.includes(r.status), `status ${r.status}`);
  }

  r = await req('GET', '/cart');
  record(
    'Cart page account CTA',
    typeof r.data === 'string' && r.data.includes('account-nav-banner'),
    'banner present'
  );

  // Add to cart (product id 9 — known in dev DB; fallback tries a few ids)
  let productId = 9;
  for (const id of [9, 8, 5, 10, 11]) {
    const tryAdd = await req('POST', '/api/cart/items', { productId: id, quantity: 1 });
    if (tryAdd.status === 200 && tryAdd.data.success) {
      productId = id;
      break;
    }
  }
  r = await req('GET', '/api/cart');
  record('POST /api/cart/items', r.data?.cart?.itemCount >= 1, `product ${productId}`);

  r = await req('GET', '/api/cart');
  record('Cart has item', r.data?.cart?.itemCount >= 1, `count=${r.data?.cart?.itemCount}`);

  r = await req('GET', '/checkout');
  record('GET /checkout (filled)', r.status === 200, `status ${r.status}`);
  record(
    'Checkout account CTA (guest)',
    r.status === 200 &&
      typeof r.data === 'string' &&
      (r.data.includes('account-nav-banner') || r.data.includes('account-nav-hint')),
    'cta present'
  );

  r = await req('POST', '/api/checkout/prepare', { shippingMethodCode: 'standard' });
  record('POST /api/checkout/prepare', r.status === 200 && r.data.success, `total=${r.data?.totals?.total}`);

  r = await req('POST', '/api/checkout/submit', {
    customerName: 'Dev Validator',
    customerEmail: 'dev-validator@test.local',
    customerPhone: '912000000',
    billingAddressLine1: 'Rua Dev 1',
    billingCity: 'Lisboa',
    billingPostalCode: '1000-001',
    billingCountry: 'Portugal',
    sameAsBilling: true,
    shippingMethodCode: 'standard',
  });
  const orderNum = r.data?.order?.orderNumber;
  record(
    'POST /api/checkout/submit',
    r.status === 200 && r.data.success && orderNum,
    orderNum || r.data?.error || `status ${r.status}`
  );

  r = await req('GET', '/api/cart');
  record('Cart cleared after order', r.data?.cart?.itemCount === 0, `count=${r.data?.cart?.itemCount}`);

  if (orderNum) {
    r = await req('GET', `/checkout/success?order=${encodeURIComponent(orderNum)}`);
    record('GET /checkout/success', r.status === 200, `status ${r.status}`);
    record(
      'Success register CTA (guest)',
      r.status === 200 && typeof r.data === 'string' && r.data.includes('/account/register'),
      `order ${orderNum}`
    );
  }

  // Customer account
  const testEmail = `dev-${Date.now()}@test.local`;
  const formRes = await fetch(BASE + '/account/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieJar,
    },
    body: new URLSearchParams({
      email: testEmail,
      password: 'testpass123',
      firstName: 'Dev',
      lastName: 'User',
      phone: '912000001',
    }),
    redirect: 'manual',
  });
  parseSetCookie(formRes.headers);
  record('POST /account/register', formRes.status === 302, `status ${formRes.status}`);

  r = await req('GET', '/account/orders');
  record('GET /account/orders (logged in)', r.status === 200, `status ${r.status}`);

  // Admin login
  const adminRes = await fetch(BASE + '/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      email: 'gonzaga@artnshine.pt',
      password: 'covil',
    }),
    redirect: 'manual',
  });
  const adminCookies = adminRes.headers.getSetCookie?.() || [];
  const adminJar = adminCookies.map((c) => c.split(';')[0]).join('; ');
  record('POST /admin/login', adminRes.status === 302, `status ${adminRes.status}`);

  if (adminJar) {
    const adminOrders = await fetch(BASE + '/admin/orders', {
      headers: { Cookie: adminJar },
      redirect: 'manual',
    });
    const adminHtml = await adminOrders.text();
    record(
      'GET /admin/orders',
      adminOrders.status === 200 && adminHtml.includes('Pedidos'),
      `status ${adminOrders.status}`
    );

    const adminSettings = await fetch(BASE + '/admin/settings/ecommerce', {
      headers: { Cookie: adminJar },
      redirect: 'manual',
    });
    const settingsHtml = await adminSettings.text();
    record(
      'GET /admin/settings/ecommerce',
      adminSettings.status === 200 && settingsHtml.includes('Activar loja'),
      `status ${adminSettings.status}`
    );
  }

  // Catalog product page exposes add-to-cart when e-commerce active
  const catalogRes = await fetch(`${BASE}/catalog/product/9`, {
    headers: { Cookie: 'sitePassword=0009' },
    redirect: 'follow',
  });
  const catalogHtml = await catalogRes.text();
  record(
    'Catalog product add-to-cart button',
    catalogHtml.includes('btn-add-to-cart'),
    `status ${catalogRes.status}`
  );

  const homeRes = await fetch(BASE + '/');
  const homeHtml = await homeRes.text();
  record(
    'Header Criar conta link',
    homeHtml.includes('/account/register') && homeHtml.includes('Criar conta'),
    `status ${homeRes.status}`
  );

  const footerRes = await fetch(BASE + '/');
  const footerHtml = await footerRes.text();
  record(
    'Footer account links',
    footerHtml.includes('/account/login') && footerHtml.includes('/account/register'),
    'present'
  );

  record(
    'Footer account links',
    footerHtml.includes('/account/login') && footerHtml.includes('/account/register'),
    'present'
  );

  // Deep account navigation
  const accountRoot = await fetch(`${BASE}/account`, { redirect: 'manual' });
  record('GET /account redirect', accountRoot.status === 302, `status ${accountRoot.status}`);

  const loggedInHome = await fetch(BASE + '/', { headers: { Cookie: cookieJar } });
  const loggedInHtml = await loggedInHome.text();
  record(
    'Logged-in header (Pedidos, no register btn)',
    loggedInHtml.includes('/account/orders') && !loggedInHtml.includes('header-account-register-btn'),
    'header state ok'
  );

  const loginWhenAuthed = await fetch(`${BASE}/account/login`, {
    headers: { Cookie: cookieJar },
    redirect: 'manual',
  });
  record(
    'Login redirect when authed',
    loginWhenAuthed.status === 302 &&
      (loginWhenAuthed.headers.get('location') || '').includes('/account/orders'),
    `status ${loginWhenAuthed.status}`
  );

  await fetch(`${BASE}/account/logout`, { headers: { Cookie: cookieJar }, redirect: 'manual' });
  const ordersAfterLogout = await fetch(`${BASE}/account/orders`, { redirect: 'manual' });
  record(
    'Logout clears session',
    ordersAfterLogout.status === 302 &&
      (ordersAfterLogout.headers.get('location') || '').includes('/account/login'),
    `status ${ordersAfterLogout.status}`
  );

  const failed = results.filter((x) => !x.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} passed ===`);
  if (failed.length) {
    console.error('\nFailed:');
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.detail}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
