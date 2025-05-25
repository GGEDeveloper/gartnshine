const { getFilteredModules } = require('../config/admin-panel');
const { formatDate, formatCurrency, truncate } = require('../utils/helpers');

/**
 * Middleware para verificar se o usuário está autenticado
 */
function requireAuth(redirectTo = '/admin/login') {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    
    // Se for uma requisição AJAX ou API
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ 
        success: false, 
        message: 'Não autorizado',
        redirectTo
      });
    }
    
    // Redireciona para a página de login
    req.session.returnTo = req.originalUrl;
    res.redirect(redirectTo);
  };
}

/**
 * Middleware para verificar se o usuário tem uma determinada função
 */
function requireRole(role, redirectTo = '/admin/unauthorized') {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      return next();
    }
    
    // Se for uma requisição AJAX ou API
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado',
        redirectTo
      });
    }
    
    // Redireciona para a página de acesso negado
    req.flash('error', 'Você não tem permissão para acessar esta página.');
    res.redirect(redirectTo);
  };
}

/**
 * Middleware para verificar se o usuário tem uma determinada permissão
 */
function requirePermission(permission, redirectTo = '/admin/unauthorized') {
  return async (req, res, next) => {
    // Se for administrador, permite o acesso
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    // Verifica se o usuário tem a permissão necessária
    const hasPermission = req.user && req.user.permissions && 
      (Array.isArray(req.user.permissions) ? 
        req.user.permissions.includes(permission) : 
        req.user.permissions[permission] === true);
    
    if (hasPermission) {
      return next();
    }
    
    // Se for uma requisição AJAX ou API
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado',
        redirectTo
      });
    }
    
    // Redireciona para a página de acesso negado
    req.flash('error', 'Você não tem permissão para acessar esta página.');
    res.redirect(redirectTo);
  };
}

/**
 * Middleware para adicionar variáveis comuns às views do painel administrativo
 */
async function adminViewLocals(req, res, next) {
  try {
    // Configurações gerais do painel
    res.locals.app = {
      name: process.env.APP_NAME || 'Gonzaga\'s Art & Shine',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      baseUrl: process.env.APP_URL || 'http://localhost:3000',
      adminPath: '/admin',
      currentUrl: req.originalUrl,
      user: req.user,
      isAdmin: req.user && req.user.role === 'admin'
    };
    
    // Configurações do painel administrativo
    res.locals.admin = {
      title: 'Painel Administrativo',
      description: 'Gerenciamento do sistema',
      layout: 'admin/layouts/modular',
      sidebarCollapsed: req.cookies.sidebarCollapsed === 'true',
      darkMode: req.cookies.darkMode === 'true',
      currentModule: req.path.split('/')[2] || 'dashboard',
      currentSection: req.path.split('/')[3] || 'index',
      currentAction: req.path.split('/')[4] || 'view',
      modules: {}
    };
    
    // Adiciona mensagens flash
    res.locals.messages = {
      success: req.flash('success'),
      error: req.flash('error'),
      info: req.flash('info'),
      warning: req.flash('warning')
    };
    
    // Carrega os módulos do painel administrativo
    if (req.user) {
      res.locals.admin.modules = await getFilteredModules(req.user);
    }
    
    // Helpers de formatação
    res.locals.helpers = {
      formatDate,
      formatCurrency,
      truncate,
      isActive: (path) => req.path.startsWith(path) ? 'active' : '',
      isExact: (path) => req.path === path ? 'active' : ''
    };
    
    next();
  } catch (error) {
    console.error('Erro no middleware adminViewLocals:', error);
    next(error);
  }
}

/**
 * Middleware para verificar se o usuário está autenticado e tem acesso ao painel
 */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Verifica se o usuário tem permissão para acessar o painel
    if (req.user.role === 'admin' || req.user.permissions?.view_admin_panel) {
      return next();
    }
    
    // Se não tiver permissão, redireciona para a página inicial
    req.flash('error', 'Você não tem permissão para acessar o painel administrativo.');
    return res.redirect('/');
  }
  
  // Se não estiver autenticado, redireciona para a página de login
  req.session.returnTo = req.originalUrl;
  res.redirect('/admin/login');
}

module.exports = {
  requireAuth,
  requireRole,
  requirePermission,
  adminViewLocals,
  ensureAuthenticated
};
