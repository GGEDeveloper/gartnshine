/**
 * Configuração do Painel Administrativo
 * 
 * Este arquivo gerencia a configuração dos módulos do painel administrativo.
 */

const path = require('path');
const fs = require('fs').promises;

// Configuração base dos módulos do painel administrativo
const adminModules = {
  dashboard: {
    name: 'Dashboard',
    icon: 'tachometer-alt',
    path: '/admin/dashboard',
    permission: 'view_dashboard',
    order: 1
  },
  products: {
    name: 'Produtos',
    icon: 'box',
    path: '/admin/products',
    permission: 'manage_products',
    order: 2,
    submenu: [
      { name: 'Todos os Produtos', path: '/admin/products' },
      { name: 'Adicionar Novo', path: '/admin/products/new' },
      { name: 'Categorias', path: '/admin/products/categories' },
      { name: 'Tags', path: '/admin/products/tags' },
      { name: 'Avaliações', path: '/admin/products/reviews' }
    ]
  },
  orders: {
    name: 'Pedidos',
    icon: 'shopping-cart',
    path: '/admin/orders',
    permission: 'manage_orders',
    order: 3,
    badge: {
      type: 'danger',
      value: '5+',
      variant: 'danger',
      pulse: true
    }
  },
  customers: {
    name: 'Clientes',
    icon: 'users',
    path: '/admin/customers',
    permission: 'manage_customers',
    order: 4
  },
  reports: {
    name: 'Relatórios',
    icon: 'chart-bar',
    path: '/admin/reports',
    permission: 'view_reports',
    order: 5,
    submenu: [
      { name: 'Vendas', path: '/admin/reports/sales' },
      { name: 'Produtos', path: '/admin/reports/products' },
      { name: 'Clientes', path: '/admin/reports/customers' },
      { name: 'Estoque', path: '/admin/reports/inventory' },
      { name: 'Financeiro', path: '/admin/reports/financial' }
    ]
  },
  marketing: {
    name: 'Marketing',
    icon: 'bullhorn',
    path: '/admin/marketing',
    permission: 'manage_marketing',
    order: 6,
    submenu: [
      { name: 'Cupons', path: '/admin/marketing/coupons' },
      { name: 'Campanhas', path: '/admin/marketing/campaigns' },
      { name: 'E-mails', path: '/admin/marketing/emails' },
      { name: 'Newsletter', path: '/admin/marketing/newsletter' }
    ]
  },
  settings: {
    name: 'Configurações',
    icon: 'cog',
    path: '/admin/settings',
    permission: 'manage_settings',
    order: 100,
    submenu: [
      { name: 'Geral', path: '/admin/settings/general' },
      { name: 'E-mail', path: '/admin/settings/email' },
      { name: 'Pagamentos', path: '/admin/settings/payment' },
      { name: 'Frete', path: '/admin/settings/shipping' },
      { name: 'Impostos', path: '/admin/settings/taxes' },
      { name: 'Usuários', path: '/admin/settings/users' },
      { name: 'Permissões', path: '/admin/settings/permissions' },
      { name: 'API', path: '/admin/settings/api' }
    ]
  }
};

/**
 * Carrega a configuração dos módulos do painel administrativo
 * @returns {Promise<Object>} Configuração dos módulos
 */
async function loadAdminModules() {
  try {
    // Aqui você pode adicionar lógica para carregar módulos dinamicamente
    // Por exemplo, verificar diretórios ou banco de dados
    
    // Ordena os módulos pela ordem definida
    const sortedModules = Object.entries(adminModules)
      .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {});
    
    return sortedModules;
  } catch (error) {
    console.error('Erro ao carregar módulos do painel administrativo:', error);
    return adminModules; // Retorna os módulos padrão em caso de erro
  }
}

/**
 * Filtra os módulos com base nas permissões do usuário
 * @param {Object} user - Objeto do usuário
 * @returns {Promise<Array>} Módulos filtrados
 */
async function getFilteredModules(user) {
  try {
    const modules = await loadAdminModules();
    
    // Se o usuário for administrador, retorna todos os módulos
    if (user && user.role === 'admin') {
      return Object.values(modules);
    }
    
    // Filtra os módulos com base nas permissões do usuário
    return Object.values(modules).filter(module => {
      // Se o módulo não requer permissão, inclui
      if (!module.permission) return true;
      
      // Verifica se o usuário tem a permissão necessária
      return user && user.permissions && user.permissions.includes(module.permission);
    });
  } catch (error) {
    console.error('Erro ao filtrar módulos:', error);
    return [];
  }
}

/**
 * Obtém o menu de navegação do painel administrativo
 * @param {Object} user - Objeto do usuário
 * @returns {Promise<Array>} Itens do menu
 */
async function getAdminMenu(user) {
  try {
    const modules = await getFilteredModules(user);
    
    return modules.map(module => ({
      name: module.name,
      icon: module.icon,
      path: module.path,
      submenu: module.submenu,
      badge: module.badge
    }));
  } catch (error) {
    console.error('Erro ao obter menu do painel administrativo:', error);
    return [];
  }
}

module.exports = {
  adminModules,
  loadAdminModules,
  getFilteredModules,
  getAdminMenu
};
