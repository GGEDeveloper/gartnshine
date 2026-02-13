/**
 * Dashboard Script
 * Inicializa e gerencia os gráficos e interações do painel administrativo
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar tooltips
  initTooltips();
  
  // Inicializar gráficos
  initCharts();
  
  // Inicializar eventos
  initEvents();
});

/**
 * Inicializa os tooltips do dashboard
 */
function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

/**
 * Inicializa os gráficos do dashboard
 */
function initCharts() {
  // Verificar se o Chart.js está disponível
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js não foi carregado. Os gráficos não serão exibidos.');
    return;
  }
  
  // Gráfico de Vendas
  const salesCtx = document.getElementById('salesChart');
  if (salesCtx) {
    new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
          label: 'Vendas (R$)',
          data: [12000, 15000, 10000, 18000, 22000, 19000, 25000, 23000, 20000, 28000, 26000, 30000],
          backgroundColor: 'rgba(79, 91, 102, 0.08)',
          borderColor: '#4f5b66',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#4f5b66',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: getChartOptions('Vendas Mensais (R$)')
    });
  }
  
  // Gráfico de Pedidos
  const ordersCtx = document.getElementById('ordersChart');
  if (ordersCtx) {
    new Chart(ordersCtx, {
      type: 'bar',
      data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Pedidos',
          data: [45, 78, 65, 92, 110, 85, 60],
          backgroundColor: '#10B981',
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: getChartOptions('Pedidos na Semana', false)
    });
  }
  
  // Gráfico de Categorias
  const categoriesCtx = document.getElementById('categoriesChart');
  if (categoriesCtx) {
    new Chart(categoriesCtx, {
      type: 'doughnut',
      data: {
        labels: ['Café em Grão', 'Cápsulas', 'Acessórios', 'Presentes'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: [
            '#4f5b66',
            '#10B981',
            '#F59E0B',
            '#8f846a'
          ],
          borderWidth: 0,
          cutout: '70%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 12, weight: 'normal' },
            bodyFont: { size: 14, weight: 'bold' },
            padding: 10,
            usePointStyle: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
}

/**
 * Retorna as opções padrão para os gráficos
 * @param {string} title - Título do gráfico
 * @param {boolean} showYGrid - Se deve mostrar a grade do eixo Y
 * @returns {Object} Opções do gráfico
 */
function getChartOptions(title, showYGrid = true) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 14,
          weight: '500'
        },
        padding: {
          bottom: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, weight: 'normal' },
        bodyFont: { size: 14, weight: 'bold' },
        padding: 10,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6B7280' // gray-500
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: showYGrid,
          color: '#F3F4F6', // gray-100
          drawBorder: false
        },
        ticks: {
          color: '#6B7280', // gray-500
          callback: function(value) {
            if (value >= 1000) {
              return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
            }
            return value;
          }
        }
      }
    }
  };
}

/**
 * Inicializa os eventos do dashboard
 */
function initEvents() {
  // Alternar tema claro/escuro
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      updateThemeIcon();
    });
  }
  
  // Atualizar ícone do tema
  function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (icon) {
      if (document.documentElement.classList.contains('dark')) {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    }
  }
  
  // Verificar tema salvo
  if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
  updateThemeIcon();
  
  // Inicializar tooltips dinâmicos
  document.addEventListener('mouseover', function(e) {
    const el = e.target.closest('[data-tooltip]');
    if (el && !el.hasAttribute('data-bs-toggle')) {
      el.setAttribute('data-bs-toggle', 'tooltip');
      el.setAttribute('data-bs-placement', 'top');
      el.setAttribute('title', el.getAttribute('data-tooltip'));
      new bootstrap.Tooltip(el);
    }
  });
}

/**
 * Formata um valor monetário
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
}

/**
 * Formata uma data
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR');
}

// Exportar funções para uso global
window.dashboard = {
  formatCurrency,
  formatDate
};

// Inicializar ao carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCharts);
} else {
  initCharts();
}
