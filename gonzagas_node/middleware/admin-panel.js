/**
 * Middleware do Painel Administrativo
 * 
 * Este middleware fornece funcionalidades comuns para o painel administrativo.
 */

const { getAdminMenu } = require('../config/admin-panel');

/**
 * Middleware para adicionar variáveis locais às visualizações
 */
function adminViewLocals(req, res, next) {
  // Adiciona variáveis comuns a todas as visualizações do painel
  res.locals.app = {
    name: process.env.APP_NAME || 'Gonzagas Admin',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.APP_URL || 'http://localhost:3000',
    adminPath: '/admin',
    user: req.user || null
  };

  // Adiciona helpers de template
  res.locals.formatDate = (date, format = 'DD/MM/YYYY') => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  res.locals.formatCurrency = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Adiciona menu de navegação
  getAdminMenu(req.user || {})
    .then(menu => {
      res.locals.adminMenu = menu;
      next();
    })
    .catch(error => {
      console.error('Erro ao carregar menu do painel:', error);
      res.locals.adminMenu = [];
      next();
    });
}

/**
 * Middleware para verificar autenticação e permissões
 */
function requireAuth(permission) {
  return (req, res, next) => {
    // Verifica se o usuário está autenticado
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl;
      return res.redirect('/admin/login');
    }

    // Verifica se o usuário tem a permissão necessária
    if (permission) {
      const user = req.user;
      
      // Se for administrador, permite acesso a tudo
      if (user.role === 'admin') {
        return next();
      }
      
      // Verifica se o usuário tem a permissão necessária
      if (!user.permissions || !user.permissions.includes(permission)) {
        req.flash('error', 'Você não tem permissão para acessar esta área.');
        return res.redirect('/admin/unauthorized');
      }
    }
    
    next();
  };
}

/**
 * Middleware para verificar se o usuário já está autenticado
 */
function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect('/admin/dashboard');
  }
  next();
}

module.exports = {
  adminViewLocals,
  requireAuth,
  redirectIfAuthenticated
};
