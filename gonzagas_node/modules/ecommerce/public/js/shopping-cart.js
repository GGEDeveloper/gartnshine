(function () {
  'use strict';

  const API = '/api/cart';

  async function request(method, url, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    return res.json();
  }

  function updateBadge(count) {
    document.querySelectorAll('.header-cart-badge').forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }

  async function refreshCart() {
    const json = await request('GET', API);
    if (json.success) updateBadge(json.cart.itemCount);
    return json;
  }

  async function addToCart(productId, quantity) {
    const json = await request('POST', API + '/items', { productId, quantity: quantity || 1 });
    if (!json.success) throw new Error(json.error || 'Erro ao adicionar');
    updateBadge(json.cart.itemCount);
    if (typeof gtag === 'function') {
      gtag('event', 'add_to_cart', { items: [{ item_id: String(productId) }] });
    }
    return json;
  }

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-add-to-cart');
    if (!btn) return;
    e.preventDefault();
    const productId = btn.dataset.productId;
    if (!productId) return;
    btn.disabled = true;
    try {
      await addToCart(parseInt(productId, 10), 1);
      btn.textContent = 'Adicionado ✓';
      setTimeout(() => { btn.textContent = 'Adicionar ao carrinho'; btn.disabled = false; }, 1500);
    } catch (err) {
      alert(err.message);
      btn.disabled = false;
    }
  });

  document.querySelectorAll('.cart-qty-input').forEach((input) => {
    input.addEventListener('change', async () => {
      const row = input.closest('[data-product-id]');
      const productId = row.dataset.productId;
      await request('PATCH', API + '/items/' + productId, { quantity: parseInt(input.value, 10) });
      location.reload();
    });
  });

  document.querySelectorAll('.cart-remove-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('[data-product-id]');
      await request('DELETE', API + '/items/' + row.dataset.productId);
      location.reload();
    });
  });

  refreshCart().catch(() => {});
  window.GonzagaCart = { addToCart, refreshCart };
})();
