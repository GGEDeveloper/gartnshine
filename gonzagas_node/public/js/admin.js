/**
 * Admin JavaScript for Gonzaga's Art & Shine
 * Modern Admin Dashboard
 * Version: 1.0.0
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initSidebar();
  initDataTables();
  initTooltips();
  initPopovers();
  initFormValidation();
  initImageUpload();
  initPasswordToggle();
  initLogout();
  
  // Initialize charts if on dashboard
  if (document.querySelector('.apexcharts')) {
    initCharts();
  }
});

/**
 * Sidebar Toggle Functionality - Enhanced for Mobile
 */
const initSidebar = () => {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const main = document.querySelector('.main, #content-wrapper');
  
  if (!sidebar || !sidebarToggle) return;
  
  // Initialize sidebar state based on screen size
  function initializeSidebarState() {
    if (window.innerWidth < 992) {
      // Mobile: Start with sidebar closed
      document.body.classList.add('sidebar-toggled');
    } else {
      // Desktop: Load saved state or default to open
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState === 'true') {
        document.body.classList.add('sidebar-toggled');
      } else {
        document.body.classList.remove('sidebar-toggled');
      }
    }
  }
  
  // Toggle sidebar on button click
  sidebarToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('sidebar-toggled');
    
    // Only save state on desktop
    if (window.innerWidth >= 992) {
      localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-toggled'));
    }
  });
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth >= 992) return; // Only for mobile
    
    const isClickInsideSidebar = sidebar.contains(e.target);
    const isClickOnToggle = sidebarToggle.contains(e.target);
    const isClickOnOverlay = e.target === document.body;
    
    if (!isClickInsideSidebar && !isClickOnToggle) {
      document.body.classList.add('sidebar-toggled');
    }
  });
  
  // Handle sidebar links on mobile - close sidebar after navigation
  const sidebarLinks = sidebar.querySelectorAll('.nav-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) {
        // Small delay to allow navigation to start
        setTimeout(() => {
          document.body.classList.add('sidebar-toggled');
        }, 100);
      }
    });
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      // Desktop: restore saved state
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState === 'true') {
        document.body.classList.add('sidebar-toggled');
      } else {
        document.body.classList.remove('sidebar-toggled');
      }
    } else {
      // Mobile: always start closed
      document.body.classList.add('sidebar-toggled');
    }
  });
  
  // Prevent body scroll when sidebar is open on mobile
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (window.innerWidth < 992) {
          const isOpen = !document.body.classList.contains('sidebar-toggled');
          document.body.style.overflow = isOpen ? 'hidden' : '';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Initialize state on load
  initializeSidebarState();
  
  // Handle touch gestures for sidebar (optional enhancement)
  let touchStartX = 0;
  let touchEndX = 0;
  
  sidebar.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  sidebar.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    if (window.innerWidth >= 992) return;
    
    const swipeDistance = touchEndX - touchStartX;
    const minSwipeDistance = 50;
    
    // Swipe left to close sidebar
    if (swipeDistance < -minSwipeDistance) {
      document.body.classList.add('sidebar-toggled');
    }
  }
};

/**
 * Initialize DataTables
 */
const initDataTables = () => {
  const tables = document.querySelectorAll('.datatable');
  
  if (tables.length > 0) {
    tables.forEach(table => {
      $(table).DataTable({
        responsive: true,
        language: {
          url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json'
        },
        dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50, 100],
        order: [],
        columnDefs: [{
          orderable: false,
          targets: 'no-sort'
        }]
      });
    });
  }
};

/**
 * Initialize Tooltips
 */
const initTooltips = () => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
};

/**
 * Initialize Popovers
 */
const initPopovers = () => {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      trigger: 'focus',
      html: true
    });
  });
};

/**
 * Form Validation
 */
const initFormValidation = () => {
  // Fetch all forms that need validation
  const forms = document.querySelectorAll('.needs-validation');
  
  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
};

/**
 * Image Upload Preview
 */
const initImageUpload = () => {
  const fileInputs = document.querySelectorAll('.image-upload');
  
  fileInputs.forEach(input => {
    input.addEventListener('change', function(e) {
      const file = this.files[0];
      const preview = document.getElementById(this.dataset.preview);
      
      if (file && preview) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
      }
    });
  });
};

/**
 * Toggle Password Visibility
 */
const initPasswordToggle = () => {
  const toggleButtons = document.querySelectorAll('.password-toggle');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
};

/**
 * Logout Functionality
 */
const initLogout = () => {
  const logoutButtons = document.querySelectorAll('.logout-btn');
  
  logoutButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Show confirmation modal or directly log out
      if (confirm('Tem certeza que deseja sair?')) {
        // Here you would typically make an API call to invalidate the session
        window.location.href = '/admin/logout';
      }
    });
  });
};

/**
 * Initialize Charts
 */
const initCharts = () => {
  // Sales Chart
  const salesChartEl = document.getElementById('salesChart');
  if (salesChartEl) {
    const salesChart = new ApexCharts(salesChartEl, {
      series: [{
        name: 'Vendas',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 100, 120, 140]
      }],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      },
      colors: ['#4361ee'],
      tooltip: {
        y: {
          formatter: function (val) {
            return 'R$ ' + val.toFixed(2).replace('.', ',');
          }
        }
      }
    });
    
    salesChart.render();
  }
  
  // Revenue Chart
  const revenueChartEl = document.getElementById('revenueChart');
  if (revenueChartEl) {
    const revenueChart = new ApexCharts(revenueChartEl, {
      series: [44, 55, 13, 43, 22],
      chart: {
        type: 'donut',
        height: 350
      },
      labels: ['Vendas Online', 'Vendas Físicas', 'Assinaturas', 'Outros', 'Descontos'],
      colors: ['#4361ee', '#3f37c9', '#3a0ca3', '#480ca8', '#4cc9f0'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      plotOptions: {
        pie: {
          donut: {
            size: '70%'
          }
        }
      },
      legend: {
        position: 'bottom'
      }
    });
    
    revenueChart.render();
  }
};

/**
 * Show Alert Message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, danger, warning, info)
 */
const showAlert = (message, type = 'info') => {
  const alertContainer = document.createElement('div');
  alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed top-3 end-3`;
  alertContainer.role = 'alert';
  alertContainer.style.zIndex = '9999';
  
  alertContainer.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  document.body.appendChild(alertContainer);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    const bsAlert = new bootstrap.Alert(alertContainer);
    bsAlert.close();
  }, 5000);
};

/**
 * Confirm Dialog
 * @param {string} message - The confirmation message
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise
 */
const confirmDialog = (message = 'Tem certeza que deseja continuar?') => {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.tabIndex = '-1';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.paddingTop = '100px';
    
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="confirmCancel">Cancelar</button>
            <button type="button" class="btn btn-primary" id="confirmOk">Confirmar</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Handle button clicks
    document.getElementById('confirmOk').addEventListener('click', () => {
      bsModal.hide();
      document.body.removeChild(modal);
      resolve(true);
    });
    
    document.getElementById('confirmCancel').addEventListener('click', () => {
      bsModal.hide();
      document.body.removeChild(modal);
      resolve(false);
    });
    
    // Handle backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        bsModal.hide();
        document.body.removeChild(modal);
        resolve(false);
      }
    });
  });
};

// Make functions available globally
window.showAlert = showAlert;
window.confirmDialog = confirmDialog;
  
  // Highlight active nav item based on current page
  const currentPath = window.location.pathname;
  document.querySelectorAll('.admin-menu-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href)) {
      link.classList.add('active');
      
      // Expand parent if in a submenu
      const parent = link.closest('.admin-submenu');
      if (parent) {
        parent.classList.add('open');
      }
    }
  });
/**
 * Data Tables
 */
function initCustomAdminTables() {
  const tables = document.querySelectorAll('.admin-table.data-table');
  
  if (tables.length > 0) {
    tables.forEach(table => {
      // Search functionality
      const tableContainer = table.closest('.admin-panel-card');
      const searchInput = tableContainer.querySelector('.table-search');
      
      if (searchInput) {
        searchInput.addEventListener('input', e => {
          const searchValue = e.target.value.toLowerCase();
          const rows = table.querySelectorAll('tbody tr');
          
          rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchValue)) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          });
        });
      }
      
      // Sorting functionality
      const headers = table.querySelectorAll('th[data-sort]');
      
      headers.forEach(header => {
        header.classList.add('sortable');
        header.addEventListener('click', () => {
          const column = header.dataset.sort;
          const direction = header.classList.contains('sort-asc') ? 'desc' : 'asc';
          
          // Remove sort classes from all headers
          headers.forEach(h => {
            h.classList.remove('sort-asc', 'sort-desc');
          });
          
          // Add sort class to clicked header
          header.classList.add(`sort-${direction}`);
          
          // Get all rows
          const tbody = table.querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          
          // Sort rows
          rows.sort((a, b) => {
            const aValue = a.querySelector(`td[data-column="${column}"]`).textContent;
            const bValue = b.querySelector(`td[data-column="${column}"]`).textContent;
            
            if (direction === 'asc') {
              return aValue.localeCompare(bValue);
            } else {
              return bValue.localeCompare(aValue);
            }
          });
          
          // Reorder rows
          rows.forEach(row => {
            tbody.appendChild(row);
          });
        });
      });
    });
  }
}

/**
 * Form Validation
 */
function initCustomAdminFormValidation() {
  const forms = document.querySelectorAll('.admin-form');
  
  if (forms.length > 0) {
    forms.forEach(form => {
      form.addEventListener('submit', e => {
        let isValid = true;
        
        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            
            // Add error message if not exists
            let errorMsg = field.nextElementSibling;
            if (!errorMsg || !errorMsg.classList.contains('error-message')) {
              errorMsg = document.createElement('div');
              errorMsg.className = 'error-message';
              errorMsg.textContent = 'Este campo é obrigatório';
              field.parentNode.insertBefore(errorMsg, field.nextSibling);
            }
          } else {
            field.classList.remove('is-invalid');
            
            // Remove error message if exists
            const errorMsg = field.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
              errorMsg.remove();
            }
          }
        });
        
        if (!isValid) {
          e.preventDefault();
          window.showAlert('Por favor, corrija os erros no formulário.', 'danger');
        }
      });
      
      // Real-time validation
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          if (input.hasAttribute('required') && !input.value.trim()) {
            input.classList.add('is-invalid');
          } else {
            input.classList.remove('is-invalid');
            
            // Remove error message if exists
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
              errorMsg.remove();
            }
          }
        });
      });
    });
  }
}

/**
 * Action Buttons
 */
function initActionButtons() {
  // Delete buttons
  const deleteButtons = document.querySelectorAll('.delete-btn');
  
  if (deleteButtons.length > 0) {
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const itemName = btn.dataset.name || 'este item';
        const confirmDelete = confirm(`Tem certeza que deseja excluir ${itemName}?`);
        
        if (confirmDelete) {
          // In a real app, we'd make an AJAX request to delete the item
          // For demo, we'll just show an alert and remove the row
          const row = btn.closest('tr');
          if (row) {
            row.style.opacity = '0';
            setTimeout(() => {
              row.remove();
              window.showAlert(`${itemName} foi excluído com sucesso.`, 'success');
            }, 300);
          }
        }
      });
    });
  }
  
  // Duplicate buttons
  const duplicateButtons = document.querySelectorAll('.duplicate-btn');
  
  if (duplicateButtons.length > 0) {
    duplicateButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const row = btn.closest('tr');
        if (row) {
          // Clone the row
          const newRow = row.cloneNode(true);
          
          // Update ID or reference
          const idCell = newRow.querySelector('td[data-column="reference"]');
          if (idCell) {
            const oldId = idCell.textContent;
            idCell.textContent = `${oldId} (Cópia)`;
          }
          
          // Insert after original row
          row.parentNode.insertBefore(newRow, row.nextSibling);
          
          // Highlight new row
          newRow.style.backgroundColor = 'rgba(128, 90, 213, 0.1)';
          setTimeout(() => {
            newRow.style.backgroundColor = '';
          }, 1500);
          
          // Reinitialize buttons on the new row
          initActionButtons();
        }
      });
    });
  }
  
  // Status toggle buttons
  const statusToggles = document.querySelectorAll('.status-toggle');
  
  if (statusToggles.length > 0) {
    statusToggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const status = e.target.checked ? 'ativo' : 'inativo';
        const itemName = toggle.dataset.name || 'Item';
        
        // In a real app, we'd make an AJAX request to update the status
        window.showAlert(`Status de ${itemName} alterado para ${status}.`, 'success');
      });
    });
  }
  
  // Checkpoint buttons
  const checkpointButtons = document.querySelectorAll('.checkpoint-btn');
  
  if (checkpointButtons.length > 0) {
    checkpointButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const checkpointName = prompt('Nome do checkpoint:');
        
        if (checkpointName) {
          // In a real app, we'd make an AJAX request to create a checkpoint
          window.showAlert(`Checkpoint "${checkpointName}" criado com sucesso.`, 'success');
        }
      });
    });
  }
}

/**
 * Charts
 */
function initChartJsCharts() {
  // Sales Chart
  const salesChartEl = document.getElementById('sales-chart');
  
  if (salesChartEl) {
    const ctx = salesChartEl.getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
        datasets: [{
          label: 'Vendas',
          data: [65, 59, 80, 81, 56, 55, 72],
          backgroundColor: 'rgba(128, 90, 213, 0.2)',
          borderColor: 'rgba(128, 90, 213, 1)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgba(128, 90, 213, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#a0aec0'
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#a0aec0'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#f7fafc'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 32, 44, 0.9)',
            titleColor: '#f7fafc',
            bodyColor: '#f7fafc',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1
          }
        }
      }
    });
  }
  
  // Category Distribution Chart
  const categoryChartEl = document.getElementById('category-chart');
  
  if (categoryChartEl) {
    const ctx = categoryChartEl.getContext('2d');
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Anéis', 'Brincos', 'Colares', 'Pulseiras', 'Outros'],
        datasets: [{
          data: [30, 25, 20, 15, 10],
          backgroundColor: [
            'rgba(128, 90, 213, 0.8)',
            'rgba(67, 197, 158, 0.8)',
            'rgba(154, 230, 180, 0.8)',
            'rgba(237, 137, 54, 0.8)',
            'rgba(113, 128, 150, 0.8)'
          ],
          borderColor: 'rgba(26, 32, 44, 0.8)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#f7fafc',
              padding: 20,
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 32, 44, 0.9)',
            titleColor: '#f7fafc',
            bodyColor: '#f7fafc',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1
          }
        }
      }
    });
  }
}

/**
 * Image Upload
 */
function initDetailedImageUpload() {
  const imageUploads = document.querySelectorAll('.image-upload');
  
  if (imageUploads.length > 0) {
    imageUploads.forEach(upload => {
      const input = upload.querySelector('input[type="file"]');
      const preview = upload.querySelector('.image-preview');
      const placeholder = upload.querySelector('.image-placeholder');
      
      input.addEventListener('change', () => {
        const file = input.files[0];
        
        if (file) {
          const reader = new FileReader();
          
          reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            
            // Clear previous preview
            preview.innerHTML = '';
            preview.appendChild(img);
            
            // Hide placeholder, show preview
            if (placeholder) placeholder.style.display = 'none';
            preview.style.display = 'block';
          };
          
          reader.readAsDataURL(file);
        }
      });
    });
  }
}

/**
 * Datepickers
 */
function initDatepickers() {
  const datepickers = document.querySelectorAll('.datepicker');
  
  if (datepickers.length > 0 && typeof flatpickr === 'function') {
    datepickers.forEach(input => {
      flatpickr(input, {
        dateFormat: 'd/m/Y',
        monthSelectorType: 'static',
        locale: 'pt',
        theme: 'dark'
      });
    });
  }
}

/**
 * Tooltips
 */
function initCustomDataTooltips() {
  const tooltips = document.querySelectorAll('[data-tooltip]');
  
  if (tooltips.length > 0) {
    tooltips.forEach(element => {
      const text = element.dataset.tooltip;
      
      element.addEventListener('mouseenter', () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        
        setTimeout(() => {
          tooltip.classList.add('show');
        }, 10);
      });
      
      element.addEventListener('mouseleave', () => {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
          tooltip.classList.remove('show');
          setTimeout(() => {
            tooltip.remove();
          }, 200);
        }
      });
    });
  }
}

/**
 * Alerts
 */
function closeAlert(alert) {
  alert.classList.remove('show');
  setTimeout(() => {
    alert.remove();
  }, 300);
} 