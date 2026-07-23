/**
 * Catalog Filters Module
 * Handles AJAX filtering without page reload
 */
class CatalogFilters {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('products-grid');
    this.form = options.form || document.getElementById('catalog-filters');
    this.resultsCount = options.resultsCount || document.querySelector('.results-count .count-number');
    this.paginationWrap = document.getElementById('catalog-pagination-wrap');
    this.apiEndpoint = options.apiEndpoint || '/api/catalog/filter';
    this.debounceDelay = options.debounceDelay || 300;
    this.debounceTimer = null;
    this.isLoading = false;
    this.currentPage = 1;

    this.init();
  }

  init() {
    if (!this.form || !this.container) {
      console.warn('CatalogFilters: Form or container not found');
      return;
    }

    // Prevent default form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.currentPage = 1;
      this.applyFilters();
    });

    this.form.addEventListener('change', e => {
      const t = e.target;
      if (!t) return;
      this.currentPage = 1;
      if (t.id === 'all-families') {
        if (t.checked) {
          this.form.querySelectorAll('.family-filter').forEach(cb => {
            cb.checked = false;
            cb.indeterminate = false;
          });
        }
        this.debouncedApply();
        return;
      }
      if (t.classList && t.classList.contains('family-filter')) {
        const allFam = document.getElementById('all-families');
        if (t.checked && allFam) allFam.checked = false;
        this.applyFamilyTreeCascade(t);
        this.debouncedApply();
        return;
      }
      this.debouncedApply();
    });

    const perPageSelect = document.getElementById('catalog-per-page');
    if (perPageSelect) {
      perPageSelect.addEventListener('change', () => {
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    this.form.querySelectorAll('.family-tree-toggle').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleFamilyBranch(btn);
      });
    });

    const expandAllBtn = document.getElementById('family-tree-expand-all');
    const collapseAllBtn = document.getElementById('family-tree-collapse-all');
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.setAllFamilyBranchesExpanded(true);
      });
    }
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.setAllFamilyBranchesExpanded(false);
      });
    }

    // Clear filters button
    const clearBtn = this.form.querySelector('.btn-filter-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearFilters();
      });
    }

    this.bindChipRemoval();
    this.syncAllFamilyIndeterminate();
    this.refreshChips();
  }

  bindChipRemoval() {
    const wrap = document.getElementById('catalog-chips');
    if (!wrap || wrap.dataset.chipBound === '1') return;
    wrap.dataset.chipBound = '1';
    wrap.addEventListener('click', e => {
      const btn = e.target.closest('.catalog-chip-remove');
      if (!btn) return;
      e.preventDefault();
      const kind = btn.getAttribute('data-chip-kind');
      if (kind === 'search') {
        const si = this.form.querySelector('input[name="search"]');
        if (si) si.value = '';
      } else if (kind === 'price') {
        const r = this.form.querySelector('#price-all');
        if (r) r.checked = true;
      } else if (kind === 'family') {
        const id = btn.getAttribute('data-chip-id');
        const cb = id && this.form.querySelector('#family-' + id);
        if (cb) {
          cb.checked = false;
          this.applyFamilyTreeCascade(cb);
        }
        const checked = this.form.querySelectorAll('.family-filter:checked');
        const allFam = document.getElementById('all-families');
        if (allFam && checked.length === 0) allFam.checked = true;
      } else if (kind === 'color') {
        const v = btn.getAttribute('data-chip-value');
        this.uncheckFacetByValue('.facet-color', v);
      } else if (kind === 'material') {
        const v = btn.getAttribute('data-chip-value');
        this.uncheckFacetByValue('.facet-material', v);
      }
      this.currentPage = 1;
      this.applyFilters();
    });
  }

  uncheckFacetByValue(selector, encodedValue) {
    if (encodedValue == null || encodedValue === '') return;
    let decoded;
    try {
      decoded = decodeURIComponent(encodedValue);
    } catch (err) {
      return;
    }
    this.form.querySelectorAll(selector).forEach(inp => {
      if (inp.value === decoded) inp.checked = false;
    });
  }

  getDirectChildByClass(parent, cls) {
    if (!parent || !parent.children) return null;
    for (let i = 0; i < parent.children.length; i++) {
      const el = parent.children[i];
      if (el.classList && el.classList.contains(cls)) return el;
    }
    return null;
  }

  getFamilyCheckboxFromTreeNode(nodeEl) {
    const row = this.getDirectChildByClass(nodeEl, 'family-tree-row');
    return row ? row.querySelector('input.family-filter') : null;
  }

  hasCheckedAncestorFamily(checkbox) {
    let wrap = checkbox.closest('.family-tree-node');
    if (!wrap) return false;
    let parent = wrap.parentElement && wrap.parentElement.closest('.family-tree-node');
    while (parent) {
      const pcb = this.getFamilyCheckboxFromTreeNode(parent);
      if (pcb && pcb.checked) return true;
      parent = parent.parentElement && parent.parentElement.closest('.family-tree-node');
    }
    return false;
  }

  getTopLevelSelectedFamilyIds(ids) {
    if (!ids || !ids.length) return [];
    const out = [];
    ids.forEach(rawId => {
      const id = typeof rawId === 'number' ? rawId : parseInt(rawId, 10);
      if (Number.isNaN(id)) return;
      const cb = this.form.querySelector(`#family-${id}`);
      if (!cb || !cb.checked) return;
      if (!this.hasCheckedAncestorFamily(cb)) out.push(id);
    });
    return out;
  }

  setFamilyBranchExpanded(childWrap, btn, open) {
    if (!childWrap) return;
    if (open) {
      childWrap.hidden = false;
      childWrap.classList.remove('is-collapsed-branch');
    } else {
      childWrap.hidden = true;
      childWrap.classList.add('is-collapsed-branch');
    }
    if (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.classList.toggle('is-collapsed', !open);
    }
  }

  toggleFamilyBranch(btn) {
    const now = Date.now();
    const last = parseInt(btn.getAttribute('data-toggle-ts') || '0', 10);
    if (now - last < 320) return;
    btn.setAttribute('data-toggle-ts', String(now));

    const node = btn.closest('.family-tree-node');
    if (!node) return;
    const childWrap = this.getDirectChildByClass(node, 'family-tree-children');
    if (!childWrap) return;
    const isOpen = btn.getAttribute('aria-expanded') !== 'false';
    this.setFamilyBranchExpanded(childWrap, btn, !isOpen);
  }

  setAllFamilyBranchesExpanded(expanded) {
    const forest = this.form.querySelector('.filter-family-tree-forest');
    if (!forest) return;
    forest.querySelectorAll('.family-tree-children').forEach(childWrap => {
      const node = childWrap.closest('.family-tree-node');
      const row = node && this.getDirectChildByClass(node, 'family-tree-row');
      const toggleBtn = row && row.querySelector('.family-tree-toggle');
      this.setFamilyBranchExpanded(childWrap, toggleBtn, expanded);
    });
  }

  applyFamilyTreeCascade(checkbox) {
    const node = checkbox.closest('.family-tree-node');
    if (!node) return;
    if (checkbox.checked) {
      node.querySelectorAll('input.family-filter').forEach(cb => {
        cb.checked = true;
        cb.indeterminate = false;
      });
    } else {
      const childWrap = this.getDirectChildByClass(node, 'family-tree-children');
      if (childWrap) {
        childWrap.querySelectorAll('input.family-filter').forEach(cb => {
          cb.checked = false;
          cb.indeterminate = false;
        });
      }
    }
    this.syncAllFamilyIndeterminate();
  }

  syncAllFamilyIndeterminate() {
    const forest = this.form.querySelector('.filter-family-tree-forest');
    if (!forest) return;
    const roots = [...forest.children].filter(
      el => el.classList && el.classList.contains('family-tree-node')
    );
    const walk = nodeEl => {
      const childWrap = this.getDirectChildByClass(nodeEl, 'family-tree-children');
      const childNodes = childWrap
        ? [...childWrap.children].filter(
            el => el.classList && el.classList.contains('family-tree-node')
          )
        : [];
      childNodes.forEach(walk);
      const parentCb = this.getFamilyCheckboxFromTreeNode(nodeEl);
      if (!parentCb) return;
      if (childNodes.length === 0) {
        parentCb.indeterminate = false;
        return;
      }
      let allChecked = true;
      let noneChecked = true;
      for (let i = 0; i < childNodes.length; i++) {
        const cb = this.getFamilyCheckboxFromTreeNode(childNodes[i]);
        if (!cb) continue;
        if (cb.checked) noneChecked = false;
        else if (cb.indeterminate) {
          noneChecked = false;
          allChecked = false;
        } else allChecked = false;
      }
      if (allChecked) {
        parentCb.checked = true;
        parentCb.indeterminate = false;
      } else if (noneChecked) {
        parentCb.checked = false;
        parentCb.indeterminate = false;
      } else {
        parentCb.checked = false;
        parentCb.indeterminate = true;
      }
    };
    roots.forEach(walk);
  }

  debouncedApply() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.applyFilters();
    }, this.debounceDelay);
  }

  getFilterData() {
    const data = {
      families: [],
      price_range: 'all',
      search: '',
      sort: 'default',
      per_page: '24',
      page: this.currentPage || 1
    };

    const sortSelect = document.getElementById('catalog-sort');
    if (sortSelect) {
      data.sort = sortSelect.value || 'default';
    }

    const perPageSelect = document.getElementById('catalog-per-page');
    if (perPageSelect) {
      data.per_page = perPageSelect.value || '24';
    }

    // Get selected families
    const familyInputs = this.form.querySelectorAll('.family-filter:checked');
    familyInputs.forEach(input => {
      data.families.push(parseInt(input.value));
    });

    // Get price range
    const priceRadio = this.form.querySelector('input[name="price_range"]:checked');
    if (priceRadio) {
      data.price_range = priceRadio.value;
    }

    // Get search query if exists
    const searchInput = this.form.querySelector('input[name="search"]');
    if (searchInput) {
      data.search = searchInput.value.trim();
    }

    data.colors = [];
    this.form.querySelectorAll('.facet-color:checked').forEach(inp => {
      if (inp.value) data.colors.push(inp.value);
    });
    data.materials = [];
    this.form.querySelectorAll('.facet-material:checked').forEach(inp => {
      if (inp.value) data.materials.push(inp.value);
    });

    return data;
  }

  async applyFilters() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading();

    try {
      const filterData = this.getFilterData();
      const queryParams = new URLSearchParams();
      
      if (filterData.families.length > 0) {
        filterData.families.forEach(id => queryParams.append('families', id));
      }
      if (filterData.price_range !== 'all') {
        queryParams.append('price_range', filterData.price_range);
      }
      if (filterData.search) {
        queryParams.append('search', filterData.search);
      }
      filterData.colors.forEach(c => queryParams.append('colors', c));
      filterData.materials.forEach(m => queryParams.append('materials', m));
      if (filterData.sort && filterData.sort !== 'default') {
        queryParams.append('sort', filterData.sort);
      }
      queryParams.append('per_page', filterData.per_page);
      queryParams.append('page', String(filterData.page));

      const url = `${this.apiEndpoint}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update URL without reload
      const catalogParams = new URLSearchParams(queryParams.toString());
      const newUrl = `/catalog${catalogParams.toString() ? '?' + catalogParams.toString() : ''}`;
      window.history.pushState({}, '', newUrl);
      window.__CATALOG_RETURN_PATH__ = newUrl;

      // Update products grid
      this.updateProductsGrid(data.products);
      
      // Update results count
      this.updateResultsCount(data.count);

      // Update filter counts if provided
      if (data.filterCounts) {
        this.updateFilterCounts(data.filterCounts);
      }
      if (data.facets) {
        this.updateFacetCounts(data.facets);
      }
      this.refreshChips();

      this.renderPaginationNav({
        page: data.page || 1,
        total_pages: data.total_pages || 1,
        per_page: data.per_page || 24
      });

    } catch (error) {
      console.error('Error applying filters:', error);
      this.showError('Erro ao aplicar filtros. Por favor, tente novamente.');
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  clearFilters() {
    this.currentPage = 1;
    // Reset form
    this.form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
      if (cb.classList && cb.classList.contains('family-filter')) cb.indeterminate = false;
    });
    this.form.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
    
    // Check "All Families"
    const allFamiliesCheckbox = document.getElementById('all-families');
    if (allFamiliesCheckbox) {
      allFamiliesCheckbox.checked = true;
    }

    // Check "All Prices"
    const allPricesRadio = document.getElementById('price-all');
    if (allPricesRadio) {
      allPricesRadio.checked = true;
    }

    // Clear search if exists
    const searchInput = this.form.querySelector('input[name="search"]');
    if (searchInput) {
      searchInput.value = '';
    }

    // Apply filters (will load all products)
    this.applyFilters();
  }

  updateProductsGrid(products) {
    if (!products || products.length === 0) {
      this.container.innerHTML = `
        <div class="no-products">
          <div class="no-products-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente ajustar os filtros ou <a href="/catalog">ver todos os produtos</a></p>
        </div>
      `;
      return;
    }

    // Generate HTML for products
    const productsHTML = products.map((product, index) => {
      return this.generateProductHTML(product, index);
    }).join('');

    // Fade out, update, fade in
    this.container.style.opacity = '0';
    setTimeout(() => {
      this.container.innerHTML = productsHTML;
      this.container.style.opacity = '1';
      
      // Reinitialize lazy loading and other modules
      if (window.catalogLazyLoad) {
        window.catalogLazyLoad.init();
      }
      if (window.catalogGrid) {
        window.catalogGrid.refresh();
      }
      if (window.catalogSort && typeof window.catalogSort.refresh === 'function') {
        window.catalogSort.refresh();
      }
    }, 300);
  }

  priceHtml(product) {
    const hide =
      typeof window.__CATALOG_SETTINGS__ !== 'undefined' &&
      window.__CATALOG_SETTINGS__.hideCatalogPrices === true;
    if (hide) {
      return '<span class="text-muted fst-italic">Preço sob consulta</span>';
    }
    return (
      product.formatted_sale_price ||
      '<span class="text-muted fst-italic">Preço sob consulta</span>'
    );
  }

  productDetailHref(product) {
    const slugOrId = encodeURIComponent(product.slug || product.id);
    const ret =
      typeof window.__CATALOG_RETURN_PATH__ === 'string' && window.__CATALOG_RETURN_PATH__
        ? window.__CATALOG_RETURN_PATH__
        : '/catalog';
    return `/catalog/product/${slugOrId}?return=${encodeURIComponent(ret)}`;
  }

  generateProductHTML(product, index) {
    const imageUrl = product.image_url ? `/media/products/${product.image_url.replace(/\.[^.]+$/, '')}-medium.jpg` : '/images/imagem-nao-disponivel.svg';
    const href = this.productDetailHref(product);

    return `
      <div class="product-item" data-product-id="${product.id}" data-aos="fade-up" data-aos-delay="${index * 50}">
        <div class="product-card">
          <div class="product-image-container">
            <a href="${href}" class="product-image-link">
              <img src="${imageUrl}" 
                   alt="${this.escapeHtml(product.name)}" 
                   class="product-image lazy-loaded"
                   loading="lazy"
                   onerror="this.onerror=null;this.src='/images/imagem-nao-disponivel.svg'">
              <div class="product-overlay">
                <a href="${href}" class="btn-quick-view">
                  <i class="fas fa-eye"></i> Ver Detalhes
                </a>
              </div>
            </a>
            ${product.is_new ? '<span class="product-badge badge-new">Novo</span>' : ''}
            ${product.on_sale ? '<span class="product-badge badge-sale">Promoção</span>' : ''}
          </div>
          <div class="product-info">
            <p class="product-reference">Ref: ${this.escapeHtml(product.reference || 'N/A')}</p>
            ${product.family_name ? `<p class="product-family"><small class="text-highlight">${this.escapeHtml(product.family_name)}</small></p>` : ''}
            <h3 class="product-title">${this.escapeHtml(product.name || 'Produto')}</h3>
            <p class="product-price">
              ${this.priceHtml(product)}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  renderPaginationNav({ page, total_pages }) {
    if (!this.paginationWrap) return;
    if (total_pages <= 1) {
      this.paginationWrap.innerHTML = '';
      return;
    }

    const start = Math.max(1, page - 2);
    const end = Math.min(total_pages, page + 2);
    const parts = ['<div class="catalog-pagination">'];

    if (page > 1) {
      parts.push(
        `<button type="button" class="pagination-btn" data-catalog-page="${page - 1}" aria-label="Página anterior"><i class="fas fa-chevron-left"></i></button>`
      );
    }
    for (let pi = start; pi <= end; pi++) {
      if (pi === page) {
        parts.push(`<span class="pagination-btn active" aria-current="page">${pi}</span>`);
      } else {
        parts.push(`<button type="button" class="pagination-btn" data-catalog-page="${pi}">${pi}</button>`);
      }
    }
    if (page < total_pages) {
      parts.push(
        `<button type="button" class="pagination-btn" data-catalog-page="${page + 1}" aria-label="Página seguinte"><i class="fas fa-chevron-right"></i></button>`
      );
    }
    parts.push('</div>');
    parts.push(
      `<p class="catalog-pagination-meta text-muted small mt-2 mb-0">Página ${page} de ${total_pages}</p>`
    );
    this.paginationWrap.innerHTML = parts.join('');

    this.paginationWrap.querySelectorAll('[data-catalog-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.getAttribute('data-catalog-page'), 10);
        if (!isNaN(p)) {
          this.currentPage = p;
          this.applyFilters();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  updateResultsCount(count) {
    if (this.resultsCount) {
      this.resultsCount.textContent = count;
      const countText = this.resultsCount.nextElementSibling;
      if (countText) {
        countText.textContent = count !== 1 ? 'produtos' : 'produto';
      }
    }
  }

  updateFilterCounts(counts) {
    if (counts.families) {
      Object.keys(counts.families).forEach(familyId => {
        const label = document.querySelector(`label[for="family-${familyId}"]`);
        if (label) {
          let countSpan = label.querySelector('.filter-count');
          if (!countSpan) {
            countSpan = document.createElement('span');
            countSpan.className = 'filter-count';
            label.appendChild(countSpan);
          }
          countSpan.textContent = ` (${counts.families[familyId]})`;
        }
      });
    }
  }

  updateFacetCounts(facets) {
    if (!facets) return;
    const applyDim = (dim, className) => {
      const map = facets[dim];
      if (!map) return;
      this.form.querySelectorAll(className).forEach(inp => {
        const k = inp.getAttribute('data-facet-key');
        if (!k) return;
        const info = map[k];
        const count = info && typeof info === 'object' ? info.count : info;
        const label = this.form.querySelector(`label[for="${inp.id}"]`);
        if (!label || count === undefined) return;
        let countSpan = label.querySelector('.filter-count');
        if (!countSpan) {
          countSpan = document.createElement('span');
          countSpan.className = 'filter-count';
          label.appendChild(countSpan);
        }
        countSpan.textContent = ` (${count})`;
      });
    };
    applyDim('colors', '.facet-color');
    applyDim('materials', '.facet-material');
  }

  refreshChips() {
    const wrap = document.getElementById('catalog-chips');
    if (!wrap || !this.form) return;

    const fd = this.getFilterData();
    const names = typeof window.__CATALOG_FAMILY_NAMES__ === 'object' && window.__CATALOG_FAMILY_NAMES__
      ? window.__CATALOG_FAMILY_NAMES__
      : {};
    const chips = [];

    const chipEl = (textHtml, btnAttrs) =>
      `<span class="catalog-chip"><span class="catalog-chip-text">${textHtml}</span><button type="button" class="catalog-chip-remove" aria-label="Remover filtro" ${btnAttrs}><i class="fas fa-times" aria-hidden="true"></i></button></span>`;

    if (fd.search && fd.search.length >= 2) {
      chips.push({
        html: chipEl(`Pesquisa: ${this.escapeHtml(fd.search)}`, 'data-chip-kind="search"')
      });
    }
    if (fd.price_range && fd.price_range !== 'all') {
      const labels = { '0-50': '≤ €50', '50-100': '€50–€100', '100+': '≥ €100' };
      chips.push({
        html: chipEl(
          `Preço: ${this.escapeHtml(labels[fd.price_range] || fd.price_range)}`,
          'data-chip-kind="price"'
        )
      });
    }
    const familyChipIds = this.getTopLevelSelectedFamilyIds(fd.families);
    familyChipIds.forEach(id => {
      const nm = names[String(id)] || names[id] || `Família #${id}`;
      chips.push({
        html: chipEl(this.escapeHtml(nm), `data-chip-kind="family" data-chip-id="${String(id)}"`)
      });
    });
    fd.colors.forEach(v =>
      chips.push({
        html: chipEl(
          `Cor: ${this.escapeHtml(v)}`,
          `data-chip-kind="color" data-chip-value="${encodeURIComponent(v)}"`
        )
      })
    );
    fd.materials.forEach(v =>
      chips.push({
        html: chipEl(
          `Material: ${this.escapeHtml(v)}`,
          `data-chip-kind="material" data-chip-value="${encodeURIComponent(v)}"`
        )
      })
    );

    if (chips.length === 0) {
      wrap.innerHTML = '';
      wrap.classList.remove('has-chips');
      return;
    }
    wrap.classList.add('has-chips');
    wrap.innerHTML =
      '<span class="catalog-chips-label">Filtros:</span> ' + chips.map(c => c.html).join(' ');
  }

  showLoading() {
    if (!this.container) return;
    
    const loadingHTML = `
      <div class="catalog-loading">
        <div class="loading-spinner"></div>
        <p>A aplicar filtros...</p>
      </div>
    `;
    
    const loadingEl = document.createElement('div');
    loadingEl.className = 'catalog-loading-overlay';
    loadingEl.innerHTML = loadingHTML;
    this.container.parentElement.appendChild(loadingEl);
  }

  hideLoading() {
    const loadingEl = document.querySelector('.catalog-loading-overlay');
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  showError(message) {
    const errorHTML = `
      <div class="catalog-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
    
    const errorEl = document.createElement('div');
    errorEl.className = 'catalog-error-message';
    errorEl.innerHTML = errorHTML;
    this.container.parentElement.insertBefore(errorEl, this.container);
    
    setTimeout(() => {
      errorEl.remove();
    }, 5000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogFilters;
} else {
  window.CatalogFilters = CatalogFilters;
}

