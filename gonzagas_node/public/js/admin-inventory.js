document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Inventory Page Script with Apply Button');
  const productTableElement = document.getElementById('product-table'); // Renamed to avoid conflict
  const productRows = productTableElement ? Array.from(productTableElement.querySelectorAll('tbody tr')) : [];

  // Initialize DataTables
  if (productTableElement) {
    console.log('Initializing DataTables for inventory table...');
    $('#product-table').DataTable({
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json'
      },
      // Since filtering and pagination are server-side, 
      // disable DataTables' client-side processing for these.
      searching: false, 
      ordering: true, // Keep client-side ordering for currently loaded data if desired
      paging: false // Assuming pagination is server-side
    });
    console.log('DataTables for inventory initialized.');
  } else {
    console.error('Inventory table #product-table not found for DataTables initialization.');
  }

  const referenceFilter = document.getElementById('filter-reference');
  const categoryFilter = document.getElementById('filter-category');
  const statusFilter = document.getElementById('filter-status');
  const stockFilter = document.getElementById('filter-stock');
  
  const applyFiltersBtn = document.getElementById('apply-filters-btn'); // New button
  const resetFiltersBtn = document.getElementById('reset-filters-btn');

  /* // Server-side filtering now
function applyFilters() {
    console.log('Applying filters...');
    const referenceValue = referenceFilter ? referenceFilter.value.toLowerCase() : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    const stockValue = stockFilter ? stockFilter.value : '';

    console.log('Filter values:', { referenceValue, categoryValue, statusValue, stockValue });

    productRows.forEach(row => {
      const rowReference = (row.dataset.reference || '').toLowerCase();
      const rowFamilyName = (row.dataset.familyName || '').toLowerCase(); // Ensure this matches your data-attribute
      const rowIsActive = row.dataset.isActive;
      const rowStockQuantity = parseInt(row.dataset.stockQuantity);

      // console.log('Processing row:', row.dataset); // Optional: for detailed row debugging

      let matchesReference = true;
      let matchesCategory = true;
      let matchesStatus = true;
      let matchesStock = true;

      if (referenceValue) {
        matchesReference = rowReference.includes(referenceValue);
      }

      if (categoryValue) {
        matchesCategory = rowFamilyName === categoryValue.toLowerCase();
      }

      if (statusValue) {
        matchesStatus = rowIsActive === statusValue;
      }

      if (stockValue) {
        if (stockValue === 'in_stock') {
          matchesStock = rowStockQuantity > 10;
        } else if (stockValue === 'low_stock') {
          matchesStock = rowStockQuantity > 0 && rowStockQuantity <= 10;
        } else if (stockValue === 'out_of_stock') {
          matchesStock = rowStockQuantity <= 0;
        } 
      }

      // console.log('Matches for this row:', { matchesReference, matchesCategory, matchesStatus, matchesStock }); // Optional

      if (matchesReference && matchesCategory && matchesStatus && matchesStock) {
        row.style.display = ''; // Show row
      } else {
        row.style.display = 'none'; // Hide row
      }
      // console.log('Row display after filter:', row.style.display); // Optional
    });
  }

  // Apply filters only when the 'Apply Filters' button is clicked
  /* // Server-side filtering now
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }*/

  /* // Server-side filtering now
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', function() {
      if (referenceFilter) referenceFilter.value = '';
      if (categoryFilter) categoryFilter.value = '';
      if (statusFilter) statusFilter.value = '';
      if (stockFilter) stockFilter.value = '';
      applyFilters(); // Apply empty filters to show all
    });
  }*/

  // Initial filter application on page load to show all items
  // applyFilters(); // Server-side filtering now

  // --- Existing Column visibility logic --- 
  const columnsBtn = document.getElementById('toggle-columns-btn');
  const columnsPanel = document.getElementById('columnsModal'); // Assuming this is the ID of your modal
  const applyColumnsBtn = document.getElementById('apply-columns-btn');
  const closeColumnsBtn = columnsPanel ? columnsPanel.querySelector('.btn-close') : null; // Or specific close button ID

  function getColumnIndex(columnName) {
    const headers = productTable ? productTable.querySelectorAll('th[data-column-name]') : [];
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].dataset.columnName === columnName) {
        return i;
      }
    }
    return -1;
  }

  function toggleColumn(colIndex, isVisible) {
    if (productTable && colIndex !== -1) {
      productTable.querySelectorAll('tr').forEach(row => {
        if (row.children[colIndex]) {
          row.children[colIndex].style.display = isVisible ? '' : 'none';
        }
      });
    }
  }

  function saveColumnPreferences() {
    const prefs = {};
    document.querySelectorAll('.column-toggle').forEach(checkbox => {
      prefs[checkbox.value] = checkbox.checked;
    });
    localStorage.setItem('inventoryColumnPrefs', JSON.stringify(prefs));
  }

  function loadColumnPreferences() {
    const prefs = localStorage.getItem('inventoryColumnPrefs');
    return prefs ? JSON.parse(prefs) : null;
  }

  if (columnsBtn && columnsPanel && applyColumnsBtn) {
    const savedPrefs = loadColumnPreferences();
    if (savedPrefs) {
      Object.entries(savedPrefs).forEach(([colName, isVisible]) => {
        const checkbox = document.querySelector(`.column-toggle[value="${colName}"]`);
        if (checkbox) {
          checkbox.checked = isVisible;
          const colIndex = getColumnIndex(colName);
          if (colIndex !== -1) {
            toggleColumn(colIndex, isVisible);
          }
        }
      });
    }

    columnsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // Using Bootstrap's modal methods if available, otherwise direct style change
      const modalInstance = bootstrap.Modal.getInstance(columnsPanel) || new bootstrap.Modal(columnsPanel);
      modalInstance.toggle();
    });

    if (closeColumnsBtn) {
        closeColumnsBtn.addEventListener('click', function() {
            const modalInstance = bootstrap.Modal.getInstance(columnsPanel);
            if (modalInstance) modalInstance.hide();
        });
    }

    applyColumnsBtn.addEventListener('click', function() {
      document.querySelectorAll('.column-toggle').forEach(checkbox => {
        const colIndex = getColumnIndex(checkbox.value);
        if (colIndex !== -1) {
          toggleColumn(colIndex, checkbox.checked);
        }
      });
      saveColumnPreferences();
      const modalInstance = bootstrap.Modal.getInstance(columnsPanel);
      if (modalInstance) modalInstance.hide();
      console.log('Seleção de colunas aplicada com sucesso');
    });
  } else {
    console.error('Elementos necessários para o modal de colunas não encontrados. Verifique os IDs: toggle-columns-btn, columnsModal, apply-columns-btn.');
  }
  
  // Handler para botão Eliminar Produto
  document.querySelectorAll('.delete-product-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      if (!productId) return;
      if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) return;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/admin/products/delete/' + productId;
      document.body.appendChild(form);
      form.submit();
    });
  });

  console.log('Inventory page script initialized successfully.');
});