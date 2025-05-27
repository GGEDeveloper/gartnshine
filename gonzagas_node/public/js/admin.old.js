/**
 * Admin JavaScript for Gonzaga's Art & Shine
 * Dashboard and admin interfaces
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize admin components
  initAdminAuth();
  initSidebar();
  initDataTables();
  initFormValidation();
  initActionButtons();
  initCharts();
  initImageUpload();
  initDatepickers();
  initTooltips();
});

/**
 * Admin Authentication
 */
function initAdminAuth() {
  const loginForm = document.getElementById('admin-login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('admin-username').value;
      const password = document.getElementById('admin-password').value;
      
      // Simple client-side validation (actual auth would be server-side)
      if (username === 'gonzaga' && password === 'covil') {
        sessionStorage.setItem('gonzagas-admin-auth', 'true');
        window.location.href = '/admin/dashboard';
      } else {
        showAlert('Usuário ou senha inválidos', 'danger');
        loginForm.classList.add('shake');
        setTimeout(() => {
          loginForm.classList.remove('shake');
        }, 500);
      }
    });
  }
  
  // Check if user is authenticated for admin pages
  const isAdminPage = window.location.pathname.includes('/admin');
  const isLoginPage = window.location.pathname.includes('/admin/login');
  const isAuthenticated = sessionStorage.getItem('gonzagas-admin-auth') === 'true';
  
  if (isAdminPage && !isLoginPage && !isAuthenticated) {
    // Redirect to login page
    window.location.href = '/admin/login';
  }
}

/**
 * Admin Sidebar
 */
function initSidebar() {
  const sidebarToggle = document.querySelector('.toggle-sidebar');
  const sidebar = document.querySelector('.admin-sidebar');
  const main = document.querySelector('.admin-main');
  
  if (sidebarToggle && sidebar && main) {
    // Toggle sidebar
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('expanded');
      
      // Save preference
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('admin-sidebar-collapsed', isCollapsed);
    });
    
    // Load saved preference
    const isCollapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
      main.classList.add('expanded');
    }
  }
  
  // Mobile sidebar toggle
  const mobileToggle = document.querySelector('.mobile-sidebar-toggle');
  
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 992 && 
          !e.target.closest('.admin-sidebar') && 
          !e.target.closest('.mobile-sidebar-toggle') && 
          sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
      }
    });
  }
  
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
}

/**
 * Data Tables
 */
function initDataTables() {
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
function initFormValidation() {
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
          showAlert('Por favor, corrija os erros no formulário.', 'danger');
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
              showAlert(`${itemName} foi excluído com sucesso.`, 'success');
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
        showAlert(`Status de ${itemName} alterado para ${status}.`, 'success');
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
          showAlert(`Checkpoint "${checkpointName}" criado com sucesso.`, 'success');
        }
      });
    });
  }
}

/**
 * Charts
 */
function initCharts() {
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
function initImageUpload() {
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
function initTooltips() {
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
function showAlert(message, type = 'info') {
  const alertsContainer = document.querySelector('.alerts-container');
  
  if (!alertsContainer) {
    // Create alerts container if it doesn't exist
    const container = document.createElement('div');
    container.className = 'alerts-container';
    document.body.appendChild(container);
  }
  
  // Create the alert
  const alert = document.createElement('div');
  alert.className = `admin-alert admin-alert-${type}`;
  
  // Icon based on type
  let icon = '';
  if (type === 'success') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  } else if (type === 'danger') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  } else if (type === 'warning') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
  } else {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }
  
  alert.innerHTML = `
    <div class="admin-alert-icon">${icon}</div>
    <div class="admin-alert-content">
      <div class="admin-alert-message">${message}</div>
    </div>
    <button class="admin-alert-close">×</button>
  `;
  
  // Add to container
  document.querySelector('.alerts-container').appendChild(alert);
  
  // Show the alert
  setTimeout(() => {
    alert.classList.add('show');
  }, 10);
  
  // Close button
  alert.querySelector('.admin-alert-close').addEventListener('click', () => {
    closeAlert(alert);
  });
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    closeAlert(alert);
  }, 5000);
}

function closeAlert(alert) {
  alert.classList.remove('show');
  setTimeout(() => {
    alert.remove();
  }, 300);
} 