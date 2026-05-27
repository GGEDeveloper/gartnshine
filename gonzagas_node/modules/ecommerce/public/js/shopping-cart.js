(function () {
  'use strict';

  const API = '/api/cart';

  // ── Utilities ──────────────────────────────────────────────────────────────

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

  let toastTimer = null;
  function showToast(msg, type) {
    const el = document.getElementById('cart-toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'cart-toast cart-toast--visible' + (type === 'error' ? ' cart-toast--error' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'cart-toast'; }, 2800);
  }

  // ── Cart page renderer ──────────────────────────────────────────────────────

  function renderCartItems(cart, totals) {
    const tbody = document.getElementById('cart-items-body');
    const summarySection = document.getElementById('cart-summary-section');
    const emptyState = document.getElementById('cart-empty-state');
    const itemsSection = document.getElementById('cart-items-section');

    // If cart is now empty, swap to empty state
    if (!cart.items || cart.items.length === 0) {
      if (itemsSection) itemsSection.remove();
      if (summarySection) summarySection.remove();
      if (!emptyState) {
        const content = document.getElementById('cart-content');
        if (content) {
          content.innerHTML = '<div id="cart-empty-state"><p class="text-muted">O carrinho está vazio.</p><a href="/catalog" class="btn btn-outline-light">Ver catálogo</a></div>';
        }
      }
      return;
    }

    // Re-render rows
    if (tbody) {
      tbody.innerHTML = cart.items.map((item) => {
        const img = item.imageFilename
          ? `<img src="/media/products/${escHtml(item.imageFilename)}" alt="${escHtml(item.name)}" class="cart-product-thumb" onerror="this.onerror=null;this.src='/images/imagem-nao-disponivel.svg'">`
          : `<img src="/images/imagem-nao-disponivel.svg" alt="" class="cart-product-thumb">`;
        const atMax = item.quantity >= item.maxStock;
        const maxWarning = atMax ? '<small class="cart-stock-max">Máximo disponível</small>' : '';
        const refHtml = item.reference ? `<small class="cart-item-ref d-block">Ref: ${escHtml(item.reference)}</small>` : '';

        return `<tr data-product-id="${item.productId}">
          <td class="cart-img-cell" data-label="">${img}</td>
          <td data-label="Produto">
            <span class="cart-item-name">${escHtml(item.name)}</span>${refHtml}
          </td>
          <td class="text-end" data-label="Preço">€${item.unitPrice.toFixed(2)}</td>
          <td class="text-center" data-label="Quantidade">
            <div class="cart-qty-stepper" data-max="${item.maxStock}">
              <button type="button" class="cart-qty-btn cart-qty-minus" aria-label="Diminuir">−</button>
              <span class="cart-qty-value">${item.quantity}</span>
              <button type="button" class="cart-qty-btn cart-qty-plus" aria-label="Aumentar" ${atMax ? 'disabled' : ''}>+</button>
            </div>${maxWarning}
          </td>
          <td class="text-end cart-item-total" data-label="Total">€${item.totalPrice.toFixed(2)}</td>
          <td data-label="">
            <button type="button" class="cart-remove-btn" aria-label="Remover ${escHtml(item.name)}">✕</button>
          </td>
        </tr>`;
      }).join('');
    }

    // Update summary numbers
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const taxEl = document.getElementById('cart-tax');
    if (subtotalEl) subtotalEl.textContent = totals.subtotal.toFixed(2);
    if (totalEl) totalEl.textContent = totals.total.toFixed(2);
    if (taxEl) taxEl.textContent = totals.taxAmount.toFixed(2);
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Public API ──────────────────────────────────────────────────────────────

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

  // ── Event delegation ────────────────────────────────────────────────────────

  // Add to cart buttons (catalog + product detail)
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-add-to-cart');
    if (!btn) return;
    e.preventDefault();
    const productId = parseInt(btn.dataset.productId, 10);
    if (!productId) return;

    // Read quantity from sibling stepper if present
    let qty = 1;
    const stepperWrap = btn.closest('.product-add-wrap') || btn.parentElement;
    const qtyVal = stepperWrap ? stepperWrap.querySelector('.detail-qty-value') : null;
    if (qtyVal) qty = parseInt(qtyVal.textContent, 10) || 1;

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '...';

    try {
      await addToCart(productId, qty);
      btn.innerHTML = '✓ Adicionado';
      showToast('Adicionado ao carrinho!');
      setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 1800);
    } catch (err) {
      showToast(err.message, 'error');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });

  // +/- buttons on product detail page
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.detail-qty-btn');
    if (!btn) return;
    const wrap = btn.closest('.product-qty-stepper');
    if (!wrap) return;
    const valEl = wrap.querySelector('.detail-qty-value');
    const maxStock = parseInt(wrap.dataset.max || '99', 10);
    let current = parseInt(valEl.textContent, 10) || 1;
    if (btn.classList.contains('detail-qty-plus')) {
      current = Math.min(current + 1, maxStock);
    } else {
      current = Math.max(current - 1, 1);
    }
    valEl.textContent = current;
    wrap.querySelector('.detail-qty-minus').disabled = current <= 1;
    wrap.querySelector('.detail-qty-plus').disabled = current >= maxStock;
  });

  // Cart page: +/- stepper (delegated — rows may be re-rendered)
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.cart-qty-btn');
    if (!btn) return;
    const stepper = btn.closest('.cart-qty-stepper');
    const row = btn.closest('[data-product-id]');
    if (!stepper || !row) return;

    const productId = parseInt(row.dataset.productId, 10);
    const maxStock = parseInt(stepper.dataset.max || '99', 10);
    const valEl = stepper.querySelector('.cart-qty-value');
    let current = parseInt(valEl.textContent, 10) || 1;

    if (btn.classList.contains('cart-qty-plus')) {
      if (current >= maxStock) return;
      current = Math.min(current + 1, maxStock);
    } else {
      current = Math.max(current - 1, 1);
    }

    btn.disabled = true;
    try {
      const json = await request('PATCH', API + '/items/' + productId, { quantity: current });
      if (json.success) {
        updateBadge(json.cart.itemCount);
        renderCartItems(json.cart, json.totals);
      } else {
        showToast(json.error || 'Erro ao actualizar', 'error');
      }
    } catch {
      showToast('Erro de ligação', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  // Cart page: remove button (delegated)
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.cart-remove-btn');
    if (!btn) return;
    const row = btn.closest('[data-product-id]');
    if (!row) return;
    const productId = parseInt(row.dataset.productId, 10);
    btn.disabled = true;
    row.style.opacity = '0.4';
    try {
      const json = await request('DELETE', API + '/items/' + productId);
      if (json.success) {
        updateBadge(json.cart.itemCount);
        renderCartItems(json.cart, json.totals);
        showToast('Item removido');
      }
    } catch {
      row.style.opacity = '1';
      btn.disabled = false;
      showToast('Erro ao remover', 'error');
    }
  });

  // ── Init ───────────────────────────────────────────────────────────────────

  refreshCart().catch(() => {});
  window.GonzagaCart = { addToCart, refreshCart };

})();
